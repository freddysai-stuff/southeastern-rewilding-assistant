import fs from 'fs';
import path from 'path';

// Data Docs live at the repo root in /data, one level above every workspace
// package (frontend, backend, mobile, shared). This resolves correctly both
// when running via `tsx` (backend/src) and after compilation (backend/dist).
const DATA_DIR = path.resolve(__dirname, '..', '..', '..', 'data');

interface DataDocIndex {
  plants: string[];
  soil: string[];
  fertilizer: string[];
  seasonal: string[];
  propagation: string[];
  glossary: string[];
}

function readJson<T>(relativePath: string): T {
  const fullPath = path.join(DATA_DIR, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8')) as T;
}

function loadIndex(): DataDocIndex {
  return readJson<DataDocIndex>('index.json');
}

/**
 * Loads all Data Docs into memory at startup (the "hybrid model" from the
 * architecture spec: docs live in Git, loaded into memory at runtime).
 * Call `reload()` during development to pick up changes without restarting.
 */
class DataDocService {
  private index: DataDocIndex;
  private cache: {
    plants: unknown[];
    soil: unknown[];
    fertilizer: unknown[];
    seasonal: unknown[];
  };

  constructor() {
    this.index = loadIndex();
    this.cache = this.loadAll();
  }

  private loadAll() {
    return {
      plants: this.index.plants.map((p) => readJson(p)),
      soil: this.index.soil.map((p) => readJson(p)),
      fertilizer: this.index.fertilizer.map((p) => readJson(p)),
      seasonal: this.index.seasonal.map((p) => readJson(p)),
    };
  }

  reload() {
    this.index = loadIndex();
    this.cache = this.loadAll();
  }

  getPlants() {
    return this.cache.plants;
  }

  getSoilProfiles() {
    return this.cache.soil;
  }

  getFertilizerRecipes() {
    return this.cache.fertilizer;
  }

  getSeasonalRules() {
    return this.cache.seasonal;
  }

  getById<T extends { id: string }>(collection: T[], id: string): T | undefined {
    return collection.find((item) => item.id === id);
  }
}

export const dataDocService = new DataDocService();
