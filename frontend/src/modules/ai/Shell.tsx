import { ModuleShell } from '../ModuleShell';
import { Panel } from '../../components/panels/Panel';
import { Button } from '../../components/buttons/Button';
import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ai.css';

interface ChatSource {
  id: string;
  category: string;
  title: string;
  score: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  mode?: 'generative' | 'extractive';
}

const SUGGESTIONS = [
  'What should I do about compacted clay soil?',
  'Which native plants attract butterflies?',
  'How often should I feed my perennial bed?',
];

export function AiShell() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = (await response.json()) as { reply: string; sources: ChatSource[]; mode: 'generative' | 'extractive' };
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, sources: data.sources, mode: data.mode }]);
    } catch (err) {
      setError('Could not reach the SERA Assistant. Is the backend running (npm run dev:backend)?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <ModuleShell
      icon="💬"
      title="AI Chat Assistant"
      description="Grounded in the Data Docs under /data — add a free OpenRouter/Groq/Ollama key (or paid OpenAI/Anthropic) to backend/.env for fully generative answers."
      plannedFeatures={[
        'Project-scoped conversation with context injection',
        'Suggested quick actions & deep links to tasks',
        'Source citations for recommendations',
        'Fallback to human review for high-risk advice',
      ]}
    >
      <Panel title="Try it">
        <div className="ai-shell__chat">
          <div className="ai-shell__messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="ai-shell__preview">
                <p className="ai-shell__hint">Ask me anything about your rewilding project!</p>
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="ai-shell__suggestion" onClick={() => void sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-shell__message ai-shell__message--${m.role}`}>
                <div className="ai-shell__bubble">
                  {m.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="ai-shell__sources">
                    <span className="ai-shell__sources-label">
                      Sources {m.mode === 'extractive' ? '(extractive, no LLM configured)' : ''}:
                    </span>
                    {m.sources.map((s) => (
                      <span key={s.id} className="ai-shell__source-chip" title={`${s.category} · relevance ${s.score}`}>
                        {s.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="ai-shell__message ai-shell__message--assistant ai-shell__typing">Thinking…</div>}
          </div>
          {error && <p className="ai-shell__error">{error}</p>}
          <form className="ai-shell__input-row" onSubmit={handleSubmit}>
            <input
              className="ai-shell__input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about plants, soil, fertilizer, or timing…"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </Panel>
    </ModuleShell>
  );
}
