import express from 'express';
import cors from 'cors';
import { dataRouter } from './routes/data';
import { projectsRouter } from './routes/projects';
import { plotsRouter } from './routes/plots';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sera-backend', phase: 'foundation' });
});

app.use('/api/data', dataRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/plots', plotsRouter);

app.listen(PORT, () => {
  console.log(`SERA backend listening on http://localhost:${PORT}`);
});
