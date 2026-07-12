export const MODULES = [
  { id: 'soil', label: 'Lawn & Soil Rebuilding', icon: '🌱' },
  { id: 'specs', label: 'Project Specifications', icon: '📋' },
  { id: 'plants', label: 'Plant Library & Placement', icon: '🌿' },
  { id: 'fertilizer', label: 'Fertilizer & Feeding System', icon: '🧪' },
  { id: 'harvesting', label: 'Harvesting & Propagation', icon: '🌾' },
  { id: 'seasonal', label: 'Calendars & Seasonal Timing', icon: '📅' },
  { id: 'ai', label: 'AI Chat Assistant', icon: '💬' },
  { id: 'pdf', label: 'Printable & PDF Generator', icon: '🖨️' },
] as const;

export type ModuleId = (typeof MODULES)[number]['id'];
