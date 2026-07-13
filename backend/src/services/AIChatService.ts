import { retrievalService, type RetrievalResult } from './RetrievalService';
import { generateChatCompletion, getConfiguredProvider, type ChatMessage } from './llm/client';
import { webSearch, isWebSearchConfigured, type WebSearchResult } from './search/WebSearchService';

export interface ChatSource {
  id: string;
  category: string;
  title: string;
  score: number;
}

export interface WebSource {
  title: string;
  url: string;
}

export interface ChatResponse {
  reply: string;
  sources: ChatSource[];
  /** Live web results (only present when TAVILY_API_KEY is set and a search actually ran). */
  webSources: WebSource[];
  /** 'generative' when an LLM produced the reply, 'extractive' for the free, offline fallback. */
  mode: 'generative' | 'extractive';
}

const SYSTEM_PROMPT = `You are the SERA Assistant, a helpful guide for native Southeastern US habitat
restoration ("rewilding"). Answer the user's question primarily using the
curated reference material provided below, citing docs as [1], [2], etc. If
"External web results" are also provided, you may use them to fill gaps the
Data Docs don't cover — cite those as [W1], [W2], etc., and make clear they
are general web info, not project-curated guidance. If neither source covers
the question, say so honestly instead of guessing. Keep answers concise and
practical.`;

/** The project is anchored to one real location, so we can always tell the LLM "where/when" it is. */
const PROJECT_LOCATION = 'Brunswick, GA (USDA Hardiness Zone 9a, coastal sandy soil)';

const SEASON_BY_MONTH = [
  'winter', 'winter', 'spring', 'spring', 'spring',
  'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter',
] as const;

function currentDateContext(): { dateLabel: string; monthName: string; season: string } {
  const now = new Date();
  return {
    dateLabel: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    monthName: now.toLocaleString('en-US', { month: 'long' }),
    season: SEASON_BY_MONTH[now.getMonth()],
  };
}

/** Builds a short "where/when" header injected into every prompt, independent of retrieval results. */
function buildContextHeader(): string {
  const { dateLabel, monthName, season } = currentDateContext();
  return `Current context: today is ${dateLabel} (${monthName}, ${season} in the Southeastern US). Project location: ${PROJECT_LOCATION}.`;
}

/**
 * Vague/time-based questions ("what should I do today?") share no keywords
 * with any Data Doc, so plain TF-IDF retrieval comes back empty even though
 * the KB has plenty of seasonal guidance. Detect that pattern and fold in
 * the current season/zone as extra search terms so retrieval actually finds
 * the relevant seasonal/fertilizer-timing docs.
 */
const TEMPORAL_QUERY_PATTERN = /\b(today|tonight|this week(end)?|this month|right now|currently)\b/i;

function buildRetrievalQuery(message: string): string {
  if (!TEMPORAL_QUERY_PATTERN.test(message)) return message;
  const { monthName, season } = currentDateContext();
  return `${message} ${season} ${monthName} zone 9a seasonal schedule fertilizer timing tasks`;
}

function toSources(results: RetrievalResult[]): ChatSource[] {
  return results.map((r) => ({
    id: r.doc.id,
    category: r.doc.category,
    title: r.doc.title,
    score: Math.round(r.score * 1000) / 1000,
  }));
}

function buildContextBlock(results: RetrievalResult[]): string {
  return results
    .map((r, i) => `[${i + 1}] (${r.doc.category}) ${r.doc.title}\n${r.doc.text}`)
    .join('\n\n');
}

/**
 * Explicit signals that the user wants something the curated Data Docs are
 * unlikely to have: current prices, news, "look this up for me", etc.
 */
const WEB_SEARCH_TRIGGER_PATTERN =
  /\b(search the web|look (this |it )?up|google (it|this)|latest|news|current price|where (can|do) i (buy|find)|buy online|nursery near|find a source|website for)\b/i;

/**
 * A local match this weak means the Data Docs probably don't cover the
 * question at all. Calibrated empirically: even fully unrelated queries
 * (e.g. "my cat keeps knocking things off the counter") score ~0.04-0.07
 * against this corpus from incidental word overlap, while genuinely
 * on-topic queries score 0.2+. 0.1 sits cleanly above that noise floor.
 */
const WEAK_LOCAL_MATCH_SCORE = 0.1;

/**
 * Decides whether to spend a Tavily search on this turn. Only fires when a
 * key is configured, and only when the local Data Docs look thin for this
 * question (no results, a weak top score) or the user explicitly asked for
 * something web-shaped — so a well-covered question never burns quota.
 */
function shouldSearchWeb(message: string, localResults: RetrievalResult[]): boolean {
  if (!isWebSearchConfigured()) return false;
  const weakLocalMatch = localResults.length === 0 || localResults[0].score < WEAK_LOCAL_MATCH_SCORE;
  return weakLocalMatch || WEB_SEARCH_TRIGGER_PATTERN.test(message);
}

function toWebSources(webResults: WebSearchResult[]): WebSource[] {
  return webResults.map((w) => ({ title: w.title, url: w.url }));
}

function buildWebContextBlock(webResults: WebSearchResult[]): string {
  if (webResults.length === 0) return '';
  const entries = webResults.map((w, i) => `[W${i + 1}] ${w.title} (${w.url})\n${w.snippet}`).join('\n\n');
  return `\n\nExternal web results (general web info, not project-curated — cite as [W1], [W2], ...):\n${entries}`;
}

/** Appends a real, clickable "From the web" link list so the reader never has to trust the LLM to reproduce a URL correctly. */
function appendWebLinks(reply: string, webResults: WebSearchResult[]): string {
  if (webResults.length === 0) return reply;
  const links = webResults.map((w, i) => `${i + 1}. [${w.title}](${w.url})`).join('\n');
  return `${reply}\n\n**From the web:**\n${links}`;
}

/** Truncates markdown text at a paragraph/sentence boundary instead of mid-word or right after a bare heading. */
function truncateAtBoundary(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const slice = trimmed.slice(0, maxLength);

  // Prefer cutting at a paragraph break, but skip any break that would leave
  // a dangling "## Heading" with no content under it.
  let boundary = 0;
  for (const match of slice.matchAll(/\r?\n\r?\n/g)) {
    const end = match.index! + match[0].length;
    const lastLine = slice.slice(0, end).trimEnd().split(/\r?\n/).pop() ?? '';
    if (!/^#{1,6}\s/.test(lastLine)) boundary = end;
  }

  if (boundary === 0) {
    const sentenceBreak = slice.lastIndexOf('. ');
    if (sentenceBreak > maxLength * 0.4) boundary = sentenceBreak + 1;
  }

  if (boundary > maxLength * 0.3) {
    return `${slice.slice(0, boundary).trim()}…`;
  }
  return `${slice.trim()}…`;
}

/** Strips a leading `# Heading` line since the title is already shown separately. */
function stripLeadingHeading(markdown: string): string {
  return markdown.replace(/^#\s+.+(\r?\n)+/, '').trim();
}

/**
 * Builds a clean, user-facing markdown excerpt for a Data Doc. Unlike
 * `ReferenceDoc.text` (which is flattened/tag-stuffed for TF-IDF search),
 * this reads the doc's original structured record (`doc.raw`) so extractive
 * replies show properly formatted prose/bullets instead of a keyword blob.
 */
function excerptForDoc(doc: RetrievalResult['doc'], maxLength = 600): string {
  const raw = doc.raw as Record<string, unknown>;

  switch (doc.category) {
    case 'articles':
    case 'propagation': {
      const body = typeof raw?.body === 'string' ? raw.body : doc.text;
      return truncateAtBoundary(stripLeadingHeading(body), maxLength);
    }
    case 'glossary': {
      const definition = typeof raw?.definition === 'string' ? raw.definition : doc.text;
      return truncateAtBoundary(definition, maxLength);
    }
    case 'plants': {
      const p = raw as { waterNeeds?: string; sunNeeds?: string; placementGuidelines?: string; companionPlants?: string[]; zone?: string };
      const lines: string[] = [];
      if (p.zone) lines.push(`- **Zone:** ${p.zone}`);
      const needs = [p.waterNeeds && `${p.waterNeeds} water`, p.sunNeeds].filter(Boolean).join(', ');
      if (needs) lines.push(`- **Needs:** ${needs}`);
      if (p.placementGuidelines) lines.push(`- **Placement:** ${p.placementGuidelines}`);
      if (Array.isArray(p.companionPlants) && p.companionPlants.length > 0) {
        lines.push(`- **Companion plants:** ${p.companionPlants.join(', ')}`);
      }
      return lines.join('\n') || truncateAtBoundary(doc.text, maxLength);
    }
    case 'soil': {
      const s = raw as { compaction?: string; notes?: string; amendments?: string[] };
      const lines: string[] = [];
      if (s.compaction) lines.push(`- **Compaction:** ${s.compaction}`);
      if (s.notes) lines.push(s.notes);
      if (Array.isArray(s.amendments) && s.amendments.length > 0) {
        lines.push(`- **Amendments:** ${s.amendments.join(', ')}`);
      }
      return lines.join('\n') || truncateAtBoundary(doc.text, maxLength);
    }
    case 'fertilizer': {
      const f = raw as { rate?: string; timing?: string; notes?: string; appliesTo?: string[] };
      const lines: string[] = [];
      if (f.rate) lines.push(`- **Rate:** ${f.rate}`);
      if (f.timing) lines.push(`- **Timing:** ${f.timing}`);
      if (Array.isArray(f.appliesTo) && f.appliesTo.length > 0) lines.push(`- **Applies to:** ${f.appliesTo.join(', ')}`);
      if (f.notes) lines.push(f.notes);
      return lines.join('\n') || truncateAtBoundary(doc.text, maxLength);
    }
    case 'seasonal': {
      const r = raw as { guidance?: string; relatedPlants?: string[] };
      const lines: string[] = [];
      if (r.guidance) lines.push(r.guidance);
      if (Array.isArray(r.relatedPlants) && r.relatedPlants.length > 0) {
        lines.push(`- **Related plants:** ${r.relatedPlants.join(', ')}`);
      }
      return lines.join('\n') || truncateAtBoundary(doc.text, maxLength);
    }
    default:
      return truncateAtBoundary(doc.text, maxLength);
  }
}

/** Deterministic, zero-cost answer built directly from the retrieved Data Docs. */
function buildExtractiveReply(results: RetrievalResult[]): string {
  if (results.length === 0) {
    return `I don't have reference data on that yet. Try asking about a specific native plant, soil condition, fertilizer, or seasonal task — my answers are grounded in the Data Docs under /data.`;
  }

  const [top, ...rest] = results;
  const lines: string[] = [];

  if (top.score < 0.05) {
    lines.push(`I don't have a strong match for that, but the closest reference I have is **${top.doc.title}**:`);
  } else {
    lines.push(`Here's what the Data Docs say about **${top.doc.title}**:`);
  }
  lines.push('');
  lines.push(excerptForDoc(top.doc));

  if (rest.length > 0) {
    lines.push('', '**Related:**');
    for (const r of rest) {
      lines.push(`- **${r.doc.title}** _(${r.doc.category})_ — ${truncateAtBoundary(excerptForDoc(r.doc, 160).replace(/\n/g, ' '), 160)}`);
    }
  }

  lines.push(
    '',
    `_Extractive answer from the Data Docs — add a free OpenRouter/Groq/Ollama key (or paid OPENAI_API_KEY/ANTHROPIC_API_KEY) to backend/.env for a fully conversational reply._`,
  );
  return lines.join('\n');
}

class AIChatService {
  async respond(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    const results = retrievalService.retrieve(buildRetrievalQuery(message), 6);
    const sources = toSources(results);

    const webResults = shouldSearchWeb(message, results) ? await webSearch(message) : [];
    const webSources = toWebSources(webResults);

    const provider = getConfiguredProvider();
    if (provider !== 'none') {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\n\n${buildContextHeader()}\n\nReference material:\n${buildContextBlock(results)}${buildWebContextBlock(webResults)}`,
        },
        ...history,
        { role: 'user', content: message },
      ];
      const generated = await generateChatCompletion(messages);
      if (generated) {
        return { reply: appendWebLinks(generated, webResults), sources, webSources, mode: 'generative' };
      }
      // Falls through to extractive mode if the LLM call failed.
    }

    return { reply: appendWebLinks(buildExtractiveReply(results), webResults), sources, webSources, mode: 'extractive' };
  }
}

export const aiChatService = new AIChatService();
