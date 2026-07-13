import { isWebSearchConfigured, webSearch } from '../services/search/WebSearchService';

describe('WebSearchService (no API key configured)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.TAVILY_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reports unconfigured when no key is set', () => {
    expect(isWebSearchConfigured()).toBe(false);
  });

  it('returns an empty array without making a network call when unconfigured', async () => {
    const results = await webSearch('native pollinator plants');
    expect(results).toEqual([]);
  });
});
