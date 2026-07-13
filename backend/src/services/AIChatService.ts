import { retrievalService, type RetrievalResult } from './RetrievalService';
import { generateChatCompletion, getConfiguredProvider, type ChatMessage } from './llm/client';

export interface ChatSource {
  id: string;
  category: string;
  title: string;
  score: number;
}

export interface ChatResponse {
  reply: string;
  sources: ChatSource[];
  /** 'generative' when an LLM produced the reply, 'extractive' for the free, offline fallback. */
  mode: 'generative' | 'extractive';
}

const SYSTEM_PROMPT = `You are the SERA Assistant, a helpful guide for native Southeastern US habitat
restoration ("rewilding"). Answer the user's question using ONLY the reference
material provided below. If the reference material doesn't cover the
question, say so honestly instead of guessing. Keep answers concise and
practical, and mention which reference docs you drew from.`;

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

/** Deterministic, zero-cost answer built directly from the retrieved Data Docs. */
function buildExtractiveReply(query: string, results: RetrievalResult[]): string {
  if (results.length === 0) {
    return `I don't have reference data on that yet. Try asking about a specific native plant, soil condition, fertilizer, or seasonal task — my answers are grounded in the Data Docs under /data.`;
  }

  const top = results[0];
  const lines = [`Here's what I found for "${query}":`, ''];
  results.forEach((r, i) => {
    lines.push(`${i + 1}. **${r.doc.title}** (${r.doc.category}) — ${summarize(r.doc.text)}`);
  });
  lines.push(
    '',
    `(Extractive answer from ${top.doc.category === 'plants' ? 'the Plant Library' : 'the Data Docs'} — add an OPENAI_API_KEY or ANTHROPIC_API_KEY to backend/.env for a fully generative, conversational answer.)`,
  );
  return lines.join('\n');
}

function summarize(text: string, maxLength = 220): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed;
}

class AIChatService {
  async respond(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    const results = retrievalService.retrieve(message, 5);
    const sources = toSources(results);

    const provider = getConfiguredProvider();
    if (provider !== 'none') {
      const messages: ChatMessage[] = [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nReference material:\n${buildContextBlock(results)}` },
        ...history,
        { role: 'user', content: message },
      ];
      const generated = await generateChatCompletion(messages);
      if (generated) {
        return { reply: generated, sources, mode: 'generative' };
      }
      // Falls through to extractive mode if the LLM call failed.
    }

    return { reply: buildExtractiveReply(message, results), sources, mode: 'extractive' };
  }
}

export const aiChatService = new AIChatService();
