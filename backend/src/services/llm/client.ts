export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type LlmProviderName = 'openai' | 'anthropic' | 'none';

/**
 * Determines which LLM (if any) is configured, based on environment
 * variables. No key is required for the app to work — see
 * AIChatService's extractive fallback.
 */
export function getConfiguredProvider(): LlmProviderName {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === 'openai' || explicit === 'anthropic' || explicit === 'none') {
    return explicit;
  }
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'none';
}

async function callOpenAi(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.3 }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${await response.text()}`);
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
    if (provider === 'openai') return await callOpenAi(messages);
    if (provider === 'anthropic') return await callAnthropic(messages);
    return null;
  } catch (error) {
    console.warn(`[llm] ${provider} call failed, falling back to extractive mode:`, error);
    return null;
  }
}
