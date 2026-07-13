export const MODULES = [
  { id: 'soil', label: 'Lawn & Soil', icon: '🌱' },
  { id: 'specs', label: 'Project Specs', icon: '📋' },
  { id: 'plants', label: 'Plant Library', icon: '🌿' },
  { id: 'fertilizer', label: 'Fertilizer', icon: '🧪' },
  { id: 'harvesting', label: 'Harvesting', icon: '🌾' },
  { id: 'seasonal', label: 'Seasonal', icon: '📅' },
  { id: 'ai', label: 'AI Chat', icon: '💬' },
  { id: 'pdf', label: 'PDF Export', icon: '🖨️' },
] as const;

export type ModuleId = (typeof MODULES)[number]['id'];

// Curated subset shown on the bottom tab bar (mirrors frontend/src/layout/MobileNavBar.tsx).
export const PRIMARY_MODULE_IDS: ModuleId[] = ['soil', 'plants', 'seasonal', 'ai'];
