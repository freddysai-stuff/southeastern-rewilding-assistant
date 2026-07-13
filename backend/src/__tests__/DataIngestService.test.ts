import { ingestWebFindings } from '../services/DataIngestService';

describe('DataIngestService (guard clauses, no disk writes)', () => {
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
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('refuses to ingest when there are no web sources', async () => {
    const result = await ingestWebFindings('what is biochar?', []);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no web sources/i);
  });

  it('refuses to ingest when no LLM provider is configured', async () => {
    const result = await ingestWebFindings('what is biochar?', [
      { title: 'Example', url: 'https://example.com/biochar', snippet: 'Biochar is a form of charcoal.' },
    ]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/configure a free llm provider/i);
  });
});
