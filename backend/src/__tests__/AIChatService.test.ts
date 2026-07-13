import { aiChatService } from '../services/AIChatService';

describe('AIChatService (no API key configured)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.AI_BASE_URL;
    delete process.env.AI_API_KEY;
    delete process.env.TAVILY_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to a grounded extractive answer with sources', async () => {
    const response = await aiChatService.respond('what should I do about compacted clay soil?');
    expect(response.mode).toBe('extractive');
    expect(response.sources.length).toBeGreaterThan(0);
    expect(response.reply.length).toBeGreaterThan(0);
  });

  it('responds gracefully with no sources when nothing matches', async () => {
    const response = await aiChatService.respond('the a an is');
    expect(response.mode).toBe('extractive');
    expect(response.sources).toEqual([]);
    expect(response.reply).toMatch(/don't have reference data/i);
  });

  it('never calls out to the web when no TAVILY_API_KEY is configured', async () => {
    const response = await aiChatService.respond('what should I do about compacted clay soil?');
    expect(response.webSources).toEqual([]);
  });
});
