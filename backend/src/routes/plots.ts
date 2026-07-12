import { Router } from 'express';
import { randomUUID } from 'crypto';
import type { Plot } from '@sera/shared';

export const plotsRouter = Router();

// In-memory store for the Foundation Phase — no database yet.
const plots: Plot[] = [];

plotsRouter.get('/', (req, res) => {
  const { projectId } = req.query;
  const result = projectId ? plots.filter((p) => p.projectId === projectId) : plots;
  res.json(result);
});

plotsRouter.get('/:id', (req, res) => {
  const plot = plots.find((p) => p.id === req.params.id);
  if (!plot) return res.status(404).json({ error: 'Plot not found' });
  res.json(plot);
});

plotsRouter.post('/', (req, res) => {
  const { projectId, geometry, soilProfileId, plantingPlanId } = req.body ?? {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });

  const plot: Plot = {
    id: randomUUID(),
    projectId,
    geometry: geometry ?? null,
    soilProfileId: soilProfileId ?? null,
    plantingPlanId: plantingPlanId ?? null,
  };
  plots.push(plot);
  res.status(201).json(plot);
});

plotsRouter.put('/:id', (req, res) => {
  const index = plots.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Plot not found' });
  plots[index] = { ...plots[index], ...req.body, id: plots[index].id };
  res.json(plots[index]);
});

plotsRouter.delete('/:id', (req, res) => {
  const index = plots.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Plot not found' });
  const [removed] = plots.splice(index, 1);
  res.json(removed);
});
