import { Router } from 'express';
import { aiChatService } from '../services/AIChatService';
import { ingestWebFindings } from '../services/DataIngestService';
import type { ChatMessage } from '../services/llm/client';
import type { WebSource } from '../services/AIChatService';

export const chatRouter = Router();

interface ChatRequestBody {
  message?: string;
  history?: ChatMessage[];
}

chatRouter.post('/', async (req, res) => {
  const { message, history } = req.body as ChatRequestBody;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const validHistory = Array.isArray(history)
    ? history.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    : [];

  try {
    const result = await aiChatService.respond(message, validHistory);
    res.json(result);
  } catch (error) {
    console.error('[chat] failed to generate response', error);
    res.status(500).json({ error: 'Failed to generate a response' });
  }
});

interface IngestWebRequestBody {
  query?: string;
  webSources?: WebSource[];
}

chatRouter.post('/ingest-web', async (req, res) => {
  const { query, webSources } = req.body as IngestWebRequestBody;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }
  const validSources = Array.isArray(webSources)
    ? webSources.filter(
        (w) => w && typeof w.title === 'string' && typeof w.url === 'string' && typeof w.snippet === 'string',
      )
    : [];

  try {
    const result = await ingestWebFindings(query, validSources);
    if (!result.success) {
      return res.status(422).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('[chat] failed to ingest web findings', error);
    res.status(500).json({ success: false, error: 'Failed to save web findings as a Data Doc' });
  }
});
