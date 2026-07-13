export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type LlmProviderName =
  | 'openai'
  | 'anthropic'
  | 'openrouter'
  | 'groq'
  | 'ollama'
  | 'openai-compatible'
  | 'none';

const KNOWN_PROVIDERS: LlmProviderName[] = [
  'openai',
  'anthropic',
  'openrouter',
  'groq',
  'ollama',
  'openai-compatible',
  'none',
];

/**
 * Determines which LLM (if any) is configured, based on environment
 * variables. No key is required for the app to work — see
 * AIChatService's extractive fallback. Checked in this order so a more
 * specific/free option wins if multiple keys happen to be set.
 */
export function getConfiguredProvider(): LlmProviderName {
  const explicit = process.env.AI_PROVIDER?.toLowerCase() as LlmProviderName | undefined;
  if (explicit && KNOWN_PROVIDERS.includes(explicit)) return explicit;

  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OLLAMA_BASE_URL) return 'ollama';
  if (process.env.AI_BASE_URL && process.env.AI_API_KEY) return 'openai-compatible';
  return 'none';
}

interface OpenAiCompatibleConfig {
  /** Base URL up to (not including) `/chat/completions`, e.g. https://api.openai.com/v1 */
  baseUrl: string;
  apiKey?: string;
  model: string;
  /** Extra headers some providers want (e.g. OpenRouter's app-attribution headers). */
  extraHeaders?: Record<string, string>;
}

/**
 * Every provider below except Anthropic speaks the same OpenAI-style
 * `/chat/completions` request/response shape — including free options like
 * OpenRouter's `:free` models, Groq's free tier, and a locally-running
 * Ollama. Rather than writing one integration per provider, we resolve each
 * to a {baseUrl, apiKey, model} config and share a single HTTP call.
 */
function resolveOpenAiCompatibleConfig(provider: LlmProviderName): OpenAiCompatibleConfig | null {
  switch (provider) {
    case 'openai':
      return {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      };
    case 'openrouter':
      // Free tier: pick any `:free`-suffixed model from https://openrouter.ai/models.
      return {
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        model: process.env.OPENROUTER_MODEL ?? 'mistralai/mistral-7b-instruct:free',
        extraHeaders: {
          'HTTP-Referer': 'https://github.com/freddysai-stuff/southeastern-rewilding-assistant',
          'X-Title': 'SERA Assistant',
        },
      };
    case 'groq':
      // Free tier, very fast. See https://console.groq.com for current free models.
      return {
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
      };
    case 'ollama':
      // Genuinely free/local — no API key required (Ollama ignores the header).
      return {
        baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
        apiKey: process.env.OLLAMA_API_KEY ?? 'ollama',
        model: process.env.OLLAMA_MODEL ?? 'llama3.1',
      };
    case 'openai-compatible':
      // Escape hatch for any other OpenAI-compatible endpoint/proxy.
      return {
        baseUrl: process.env.AI_BASE_URL ?? '',
        apiKey: process.env.AI_API_KEY,
        model: process.env.AI_MODEL ?? 'default',
      };
    default:
      return null;
  }
}

async function callOpenAiCompatible(messages: ChatMessage[], config: OpenAiCompatibleConfig): Promise<string> {
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(config.extraHeaders ?? {}) };
  if (config.apiKey) headers.Authorization = ['Bearer', config.apiKey].join(' ');
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: config.model, messages, temperature: 0.3 }),
  });
  if (!response.ok) {
    throw new Error(`${url} request failed: ${response.status} ${await response.text()}`);
  }
  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content?.trim() ?? '';
}

async function callAnthropic(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-haiku-20241022';
  const system = messages.find((m) => m.role === 'system')?.content;
  const conversation = messages.filter((m) => m.role !== 'system');
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system,
      max_tokens: 1024,
      messages: conversation.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!response.ok) {
    throw new Error(`Anthropic request failed: ${response.status} ${await response.text()}`);
  }
  const data = (await response.json()) as { content: { type: string; text: string }[] };
  return (
    data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim() ?? ''
  );
}

/**
 * Sends a chat completion request to whichever provider is configured via
 * env vars. Returns `null` (never throws) when no provider is configured or
 * the call fails, so callers can gracefully fall back to extractive answers.
 */
export async function generateChatCompletion(messages: ChatMessage[]): Promise<string | null> {
  const provider = getConfiguredProvider();
  if (provider === 'none') return null;

  try {
    if (provider === 'anthropic') return await callAnthropic(messages);
    const config = resolveOpenAiCompatibleConfig(provider);
    if (config && config.baseUrl) return await callOpenAiCompatible(messages, config);
    return null;
  } catch (error) {
    console.warn(`[llm] ${provider} call failed, falling back to extractive mode:`, error);
    return null;
  }
}
