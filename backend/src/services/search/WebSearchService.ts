export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

const TAVILY_ENDPOINT = 'https://api.tavily.com/search';
const REQUEST_TIMEOUT_MS = 8000;

/** True when a Tavily API key is present, mirroring the LLM provider-detection pattern in llm/client.ts. */
export function isWebSearchConfigured(): boolean {
  return Boolean(process.env.TAVILY_API_KEY);
}

/**
 * Live web search via Tavily (https://tavily.com), a search API built for AI
 * agents with a free tier (1,000 searches/month, no card required). Used to
 * ground answers the Data Docs don't cover, and to surface real, clickable
 * links back to the user. Returns `[]` (never throws) when unconfigured or
 * the call fails, so callers can always fall back to Data-Doc-only answers.
 */
export async function webSearch(query: string, maxResults = 4): Promise<WebSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ['Bearer', apiKey].join(' '),
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: 'basic',
        include_answer: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[websearch] Tavily request failed: ${response.status} ${await response.text()}`);
      return [];
    }

    const data = (await response.json()) as {
      results?: { title: string; url: string; content: string }[];
    };
    return (data.results ?? []).map((r) => ({ title: r.title, url: r.url, snippet: r.content }));
  } catch (error) {
    console.warn('[websearch] Tavily call failed, continuing without web results:', error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
