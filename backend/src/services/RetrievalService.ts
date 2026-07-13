import { dataDocService } from './DataDocService';

/**
 * A single searchable Data Doc, flattened to plain text for retrieval.
 * This is the "reference doc" unit the AI Chat Assistant grounds its
 * answers in — every fact it cites traces back to one of these.
 */
export interface ReferenceDoc {
  id: string;
  category: 'plants' | 'soil' | 'fertilizer' | 'seasonal' | 'propagation' | 'glossary';
  title: string;
  text: string;
  /** Original structured record, returned to the caller for rich source cards. */
  raw: unknown;
}

export interface RetrievalResult {
  doc: ReferenceDoc;
  score: number;
}

interface PlantRecord {
  id: string;
  commonName: string;
  scientificName: string;
  zone: string;
  waterNeeds?: string;
  sunNeeds?: string;
  placementGuidelines?: string;
  companionPlants?: string[];
}

interface SoilRecord {
  id: string;
  name: string;
  compaction?: string;
  notes?: string;
  amendments?: string[];
}

interface FertilizerRecord {
  id: string;
  product: string;
  rate?: string;
  timing?: string;
  notes?: string;
  appliesTo?: string[];
}

interface SeasonalRecord {
  id: string;
  zone: string;
  season: string;
  guidance?: string;
  relatedPlants?: string[];
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'for', 'of', 'in', 'on', 'at', 'to', 'and', 'or',
  'but', 'with', 'about', 'as', 'by', 'it', 'this', 'that', 'my', 'i',
  'me', 'you', 'your', 'what', 'when', 'how', 'should', 'can', 'will',
  'if', 'so', 'not', 'have', 'has', 'had',
]);

const CATEGORY_WEIGHT: Record<ReferenceDoc['category'], number> = {
  plants: 1.15,
  soil: 1.15,
  fertilizer: 1.1,
  seasonal: 1.1,
  propagation: 1.05,
  glossary: 0.75,
};

function stem(word: string): string {
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map(stem);
}

function safeJoin(...parts: Array<string | number | boolean | undefined | null>): string {
  return parts.filter((p) => p !== undefined && p !== null && p !== '' && p !== false).join(' ');
}

/** Flattens every Data Doc category into a common, searchable text shape. */
function buildCorpus(): ReferenceDoc[] {
  const docs: ReferenceDoc[] = [];

  for (const plant of dataDocService.getPlants() as PlantRecord[]) {
    docs.push({
      id: plant.id,
      category: 'plants',
      title: `${plant.commonName} (${plant.scientificName})`,
      text: safeJoin(
        plant.commonName,
        plant.scientificName,
        `zone ${plant.zone}`,
        plant.waterNeeds && `${plant.waterNeeds} water needs`,
        plant.sunNeeds,
        plant.placementGuidelines,
        Array.isArray(plant.companionPlants) && `companion plants ${plant.companionPlants.join(' ')}`,
      ),
      raw: plant,
    });
  }

  for (const soil of dataDocService.getSoilProfiles() as SoilRecord[]) {
    docs.push({
      id: soil.id,
      category: 'soil',
      title: soil.name,
      text: safeJoin(
        soil.name,
        soil.compaction && `${soil.compaction} compaction`,
        soil.notes,
        Array.isArray(soil.amendments) && `amendments ${soil.amendments.join(' ')}`,
      ),
      raw: soil,
    });
  }

  for (const fert of dataDocService.getFertilizerRecipes() as FertilizerRecord[]) {
    docs.push({
      id: fert.id,
      category: 'fertilizer',
      title: fert.product,
      text: safeJoin(
        fert.product,
        fert.rate,
        fert.timing,
        fert.notes,
        Array.isArray(fert.appliesTo) && `applies to ${fert.appliesTo.join(' ')}`,
      ),
      raw: fert,
    });
  }

  for (const rule of dataDocService.getSeasonalRules() as SeasonalRecord[]) {
    docs.push({
      id: rule.id,
      category: 'seasonal',
      title: `Zone ${rule.zone} — ${rule.season}`,
      text: safeJoin(
        `zone ${rule.zone}`,
        rule.season,
        rule.guidance,
        Array.isArray(rule.relatedPlants) && `related plants ${rule.relatedPlants.join(' ')}`,
      ),
      raw: rule,
    });
  }

  for (const note of dataDocService.getPropagationNotes()) {
    const headingMatch = note.body.match(/^#\s+(.+)$/m);
    docs.push({
      id: note.id,
      category: 'propagation',
      title: headingMatch?.[1] ?? `Propagating ${note.id}`,
      text: safeJoin(note.frontmatter.method as string, note.frontmatter.plantId as string, note.body),
      raw: note,
    });
  }

  for (const glossary of dataDocService.getGlossaryDocs()) {
    // Split the glossary into one reference doc per **Term** — bolded entry so
    // retrieval can surface a single definition instead of the whole file.
    const entries = glossary.body.split(/\n(?=\*\*)/).filter((e) => e.trim().startsWith('**'));
    entries.forEach((entry, i) => {
      const termMatch = entry.match(/^\*\*(.+?)\*\*/);
      docs.push({
        id: `${glossary.id}-${termMatch?.[1]?.toLowerCase().replace(/\s+/g, '-') ?? i}`,
        category: 'glossary',
        title: termMatch?.[1] ?? 'Glossary term',
        text: entry,
        raw: { term: termMatch?.[1], definition: entry },
      });
    });
  }

  return docs;
}

/**
 * Minimal, dependency-free TF-IDF + cosine similarity search index over the
 * Data Docs. Deliberately avoids calling any external embedding API — this
 * runs entirely offline and for free, so the AI Chat Assistant is grounded
 * in real reference data from day one, before any LLM key is configured.
 */
class RetrievalService {
  private docs: ReferenceDoc[] = [];
  private docTokens: string[][] = [];
  private idf = new Map<string, number>();

  constructor() {
    this.reload();
  }

  reload() {
    this.docs = buildCorpus();
    this.docTokens = this.docs.map((doc) => tokenize(doc.text));
    this.idf = this.computeIdf(this.docTokens);
  }

  private computeIdf(docTokens: string[][]): Map<string, number> {
    const docFreq = new Map<string, number>();
    for (const tokens of docTokens) {
      for (const term of new Set(tokens)) {
        docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
      }
    }
    const idf = new Map<string, number>();
    const totalDocs = docTokens.length || 1;
    for (const [term, freq] of docFreq) {
      idf.set(term, Math.log((1 + totalDocs) / (1 + freq)) + 1);
    }
    return idf;
  }

  private vectorize(tokens: string[]): Map<string, number> {
    const termFreq = new Map<string, number>();
    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) ?? 0) + 1);
    }
    const vector = new Map<string, number>();
    for (const [term, freq] of termFreq) {
      vector.set(term, freq * (this.idf.get(term) ?? 1));
    }
    return vector;
  }

  private cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (const value of a.values()) magA += value * value;
    for (const value of b.values()) magB += value * value;
    const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
    for (const [term, value] of smaller) {
      const otherValue = larger.get(term);
      if (otherValue) dot += value * otherValue;
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  /** Returns the top-N most relevant Data Docs for a free-text query. */
  retrieve(query: string, topN = 5): RetrievalResult[] {
    const queryVector = this.vectorize(tokenize(query));
    if (queryVector.size === 0) return [];

    const results = this.docs
      .map((doc, i) => ({
        doc,
        // Glossary entries are short, so their cosine similarity naturally
        // skews higher than longer, more informative plant/soil/etc docs.
        // A mild per-category weight keeps glossary useful (for "what does
        // X mean" queries) without letting it crowd out the more actionable
        // reference docs.
        score: this.cosineSimilarity(queryVector, this.vectorize(this.docTokens[i])) * CATEGORY_WEIGHT[doc.category],
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    return results;
  }
}

export const retrievalService = new RetrievalService();
