import { Router } from 'express';
import { aiChatService } from '../services/AIChatService';
import type { ChatMessage } from '../services/llm/client';

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
