import { Routes, Route } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { Dashboard } from './modules/Dashboard';
import { SoilShell } from './modules/soil/Shell';
import { SpecsShell } from './modules/specs/Shell';
import { PlantsShell } from './modules/plants/Shell';
import { FertilizerShell } from './modules/fertilizer/Shell';
import { HarvestingShell } from './modules/harvesting/Shell';
import { SeasonalShell } from './modules/seasonal/Shell';
import { AiShell } from './modules/ai/Shell';
import { PdfShell } from './modules/pdf/Shell';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/soil" element={<SoilShell />} />
        <Route path="/specs" element={<SpecsShell />} />
        <Route path="/plants" element={<PlantsShell />} />
        <Route path="/fertilizer" element={<FertilizerShell />} />
        <Route path="/harvesting" element={<HarvestingShell />} />
        <Route path="/seasonal" element={<SeasonalShell />} />
        <Route path="/ai" element={<AiShell />} />
        <Route path="/pdf" element={<PdfShell />} />
      </Routes>
    </AppShell>
  );
}
