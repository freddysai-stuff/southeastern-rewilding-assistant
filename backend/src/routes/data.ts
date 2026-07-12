import { Router } from 'express';
import { dataDocService } from '../services/DataDocService';

export const dataRouter = Router();

dataRouter.get('/plants', (_req, res) => {
  res.json(dataDocService.getPlants());
});

dataRouter.get('/plants/:id', (req, res) => {
  const plant = dataDocService.getById(
    dataDocService.getPlants() as { id: string }[],
    req.params.id,
  );
  if (!plant) return res.status(404).json({ error: 'Plant not found' });
  res.json(plant);
});

dataRouter.get('/soil', (_req, res) => {
  res.json(dataDocService.getSoilProfiles());
});

dataRouter.get('/fertilizer', (_req, res) => {
  res.json(dataDocService.getFertilizerRecipes());
});

dataRouter.get('/seasonal', (_req, res) => {
  res.json(dataDocService.getSeasonalRules());
});
