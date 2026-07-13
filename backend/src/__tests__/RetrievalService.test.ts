import { retrievalService } from '../services/RetrievalService';

describe('RetrievalService', () => {
  it('surfaces soil docs for a clay soil query', () => {
    const results = retrievalService.retrieve('my lawn has compacted clay soil', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.doc.category === 'soil')).toBe(true);
  });

  it('surfaces pollinator plant docs for a butterfly query', () => {
    const results = retrievalService.retrieve('what native plants attract butterflies', 5);
    expect(results.length).toBeGreaterThan(0);
    const ids = results.map((r) => r.doc.id);
    expect(ids).toContain('asclepias-tuberosa');
  });

  it('surfaces the fertilizer doc for a feeding-schedule query', () => {
    const results = retrievalService.retrieve('how often should I feed my perennial bed with kelp tea', 3);
    expect(results.some((r) => r.doc.category === 'fertilizer')).toBe(true);
  });

  it('surfaces glossary definitions for a terminology query', () => {
    const results = retrievalService.retrieve('what does rewilding mean', 3);
    expect(results.some((r) => r.doc.category === 'glossary')).toBe(true);
  });

  it('returns nothing for an empty/meaningless query', () => {
    const results = retrievalService.retrieve('the a an is', 3);
    expect(results).toEqual([]);
  });

  it('scores results in descending order', () => {
    const results = retrievalService.retrieve('native butterfly weed propagation seeds', 5);
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
