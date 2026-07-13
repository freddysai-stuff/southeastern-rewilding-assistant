import { Router } from 'express';
import { randomUUID } from 'crypto';
import type { Project } from '@sera/shared';

export const projectsRouter = Router();

// In-memory store for the Foundation Phase — no database yet.
const projects: Project[] = [];

projectsRouter.get('/', (_req, res) => {
  res.json(projects);
});

projectsRouter.get('/:id', (req, res) => {
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

projectsRouter.post('/', (req, res) => {
  const { name, location, timezone, siteMetadata, ownerId } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });

  const project: Project = {
    id: randomUUID(),
    name,
    location: location ?? '',
    timezone: timezone ?? 'America/New_York',
    siteMetadata: siteMetadata ?? {},
    ownerId: ownerId ?? 'local-user',
  };
  projects.push(project);
  res.status(201).json(project);
});

projectsRouter.put('/:id', (req, res) => {
  const index = projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  projects[index] = { ...projects[index], ...req.body, id: projects[index].id };
  res.json(projects[index]);
});

projectsRouter.delete('/:id', (req, res) => {
  const index = projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  const [removed] = projects.splice(index, 1);
  res.json(removed);
});
