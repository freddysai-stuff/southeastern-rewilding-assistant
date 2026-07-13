import fs from 'fs';
import path from 'path';
import { generateChatCompletion, getConfiguredProvider, type ChatMessage } from './llm/client';
import { dataDocService } from './DataDocService';
import { retrievalService } from './RetrievalService';
import type { WebSource } from './AIChatService';

// Same resolution trick as DataDocService — /data lives one level above every workspace package.
const DATA_DIR = path.resolve(__dirname, '..', '..', '..', 'data');
const ARTICLES_DIR = path.join(DATA_DIR, 'articles');
const INDEX_PATH = path.join(DATA_DIR, 'index.json');

export interface IngestWebResult {
  success: boolean;
  error?: string;
  doc?: { id: string; title: string; category: 'articles'; filePath: string };
}

interface DraftDoc {
  title: string;
  tags: string[];
  body: string;
}

/** Turns "Some Title! (v2)" into "some-title-v2" — matches existing Data Doc id conventions. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Best-effort JSON extraction — strips ```json fences and tolerates leading/trailing chatter. */
function extractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate.trim());
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function isDraftDoc(value: unknown): value is DraftDoc {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.title === 'string' && v.title.trim().length > 0 && typeof v.body === 'string' && v.body.trim().length > 0;
}

const DRAFT_SYSTEM_PROMPT = `You turn live web search results into a single reference note for the SERA
(Southeastern Rewilding Assistant) knowledge base — a project about native habitat
restoration and organic lawn-to-wildscape conversion in Brunswick, GA (Zone 9a).

Output ONLY a single JSON object, no markdown code fences, no commentary before or
after, matching exactly this shape:
{"title": string, "tags": string[] (3-6 short kebab-case or single-word tags), "body": string}

Rules for "body":
- Markdown, 2-5 short paragraphs and/or bullet lists. No top-level "# Heading" (the
  title is stored separately).
- Be factual and concise. Only include what the sources actually support — never
  invent specific prices, dates, quantities, or claims not present in the sources.
- Where relevant, note how it applies (or doesn't) to coastal Georgia / Zone 9a
  conditions, but don't force a connection that isn't there.
- If the sources disagree or are inconclusive, say so plainly rather than picking one.`;

function buildDraftUserPrompt(query: string, webSources: WebSource[]): string {
  const sourceBlock = webSources
    .map((w, i) => `[${i + 1}] ${w.title} (${w.url})\n${w.snippet}`)
    .join('\n\n');
  return `Original question: "${query}"\n\nWeb sources:\n${sourceBlock}`;
}

function readIndex(): Record<string, string[]> {
  return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8')) as Record<string, string[]>;
}

function writeIndex(index: Record<string, string[]>): void {
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
}

/** Appends a numeric suffix if the slug collides with an existing article id. */
function uniqueSlug(base: string, existingIds: Set<string>): string {
  if (!existingIds.has(base)) return base;
  let i = 2;
  while (existingIds.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

/**
 * Drafts a new `articles/*.md` Data Doc from live web search results and
 * registers it immediately (per user's choice: live + visibly tagged, not a
 * review queue). Always lands in the `articles` category — web summaries are
 * prose, not the strict structured facts the plants/soil/fertilizer/seasonal
 * JSON schemas require, so forcing them into those schemas would risk
 * fabricating fields we can't actually source. The `web-sourced` tag and
 * `source`/`sourceUrls` frontmatter make the provenance visible everywhere
 * the doc shows up (chat citations, /data browsing, validate-data output).
 */
export async function ingestWebFindings(query: string, webSources: WebSource[]): Promise<IngestWebResult> {
  if (webSources.length === 0) {
    return { success: false, error: 'No web sources on this message to save.' };
  }
  if (getConfiguredProvider() === 'none') {
    return { success: false, error: 'Configure a free LLM provider (OpenRouter/Groq/Ollama) in backend/.env to draft Data Docs.' };
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: DRAFT_SYSTEM_PROMPT },
    { role: 'user', content: buildDraftUserPrompt(query, webSources) },
  ];

  const raw = await generateChatCompletion(messages);
  if (!raw) {
    return { success: false, error: 'The LLM call failed — try again in a moment.' };
  }

  const parsed = extractJson(raw);
  if (!isDraftDoc(parsed)) {
    return { success: false, error: 'Could not parse a draft Data Doc from the model output — try again.' };
  }

  const index = readIndex();
  const existingIds = new Set(index.articles.map((p) => path.basename(p, '.md')));
  const id = uniqueSlug(slugify(parsed.title) || 'web-note', existingIds);

  const tags = Array.from(new Set([...(Array.isArray(parsed.tags) ? parsed.tags : []), 'web-sourced']));
  const updated = new Date().toISOString().slice(0, 10);
  const sourceUrls = webSources.map((w) => w.url);

  const frontmatter = [
    '---',
    `id: ${id}`,
    `title: ${parsed.title.replace(/:/g, ' —')}`,
    `tags: [${tags.join(', ')}]`,
    'relatedPlants: []',
    'version: 1.0.0',
    `updated: ${updated}`,
    'source: web',
    `sourceUrls: [${sourceUrls.map((u) => `"${u}"`).join(', ')}]`,
    '---',
  ].join('\n');

  const disclaimer =
    '> **Web-sourced note:** generated from a live web search and not manually reviewed. ' +
    'Treat as general information, not project-verified guidance.';

  const fileContent = `${frontmatter}\n# ${parsed.title}\n\n${disclaimer}\n\n${parsed.body.trim()}\n`;

  if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  fs.writeFileSync(path.join(ARTICLES_DIR, `${id}.md`), fileContent, 'utf8');

  index.articles.push(`articles/${id}.md`);
  writeIndex(index);

  // Make it searchable immediately, without a server restart.
  dataDocService.reload();
  retrievalService.reload();

  return { success: true, doc: { id, title: parsed.title, category: 'articles', filePath: `data/articles/${id}.md` } };
}
