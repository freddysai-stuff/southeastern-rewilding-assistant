/**
 * Core domain entities for the Southeastern Rewilding Assistant.
 * Mirrors the data model snapshot from the initial architecture spec.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  authProviders: string[];
  preferences: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  timezone: string;
  siteMetadata: Record<string, unknown>;
  ownerId: string;
}

export interface Plot {
  id: string;
  projectId: string;
  geometry: unknown;
  soilProfileId: string | null;
  plantingPlanId: string | null;
}

export interface SoilProfile {
  id: string;
  plotId: string;
  ph: number;
  organicMatter: number;
  compaction: 'low' | 'medium' | 'high';
  amendments: string[];
}

export type BloomWindow = { startMonth: number; endMonth: number };
export type WaterNeeds = 'low' | 'medium' | 'high';

export interface Plant {
  id: string;
  scientificName: string;
  commonName: string;
  zone: string;
  bloomWindow: BloomWindow;
  waterNeeds: WaterNeeds;
  imageRefs: string[];
  placementGuidelines: string;
}

export interface PlantInstance {
  id: string;
  plantId: string;
  x: number;
  y: number;
}

export interface PlantingPlan {
  id: string;
  plotId: string;
  plantInstances: PlantInstance[];
  spacing: number;
  density: number;
}

export interface FertilizerSchedule {
  id: string;
  plotId: string;
  product: string;
  rate: string;
  timing: string;
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  plantInstanceId: string;
  date: string;
  yield: string;
  propagationNotes?: string;
}

export interface CalendarEvent {
  id: string;
  projectId: string;
  type: string;
  start: string;
  end: string;
  source: 'local' | 'google';
}

export interface Task {
  id: string;
  projectId: string;
  assignee: string;
  dueDate: string;
  status: 'todo' | 'in_progress' | 'done';
  linkedEntity?: string;
}
