import { useEffect, useRef, useState } from 'react';
import { Bot, Plus, Send, Sparkles, Trash2, X, MessageSquare, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAssistantReply, suggestedQuestions, type AssistantSource } from '@/lib/assistant';
import type { Article } from '@/lib/types';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: AssistantSource[] | null;
  created_at: string;
};

type ChatSession = {
  id: string;
  title: string;
  updated_at: string;
};

export function ChatAssistant({ articles, onClose }: { articles: Article[]; onClose: () => void }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) void loadMessages(activeSessionId);
    else setMessages([]);
  }, [activeSessionId]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, thinking]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    const { data } = await supabase.from('assistant_sessions').select('*').order('updated_at', { ascending: false });
    const list = (data ?? []) as ChatSession[];
    setSessions(list);
    setLoadingSessions(false);
    if (list.length > 0) setActiveSessionId(list[0].id);
  };

  const loadMessages = async (sessionId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase.from('assistant_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    setMessages((data ?? []) as ChatMessage[]);
    setLoadingMessages(false);
  };

  const startNewSession = async () => {
    const { data, error } = await supabase.from('assistant_sessions').insert({ title: 'New conversation' }).select().maybeSingle();
    if (error || !data) return;
    const session = data as ChatSession;
    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
    setMessages([]);
    setSidebarOpen(false);
  };

  const deleteSession = async (sessionId: string) => {
    await supabase.from('assistant_sessions').delete().eq('id', sessionId);
    const remaining = sessions.filter((session) => session.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      setMessages([]);
    }
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const { data, error } = await supabase.from('assistant_sessions').insert({ title: trimmed.slice(0, 40) }).select().maybeSingle();
      if (error || !data) return;
      const session = data as ChatSession;
      sessionId = session.id;
      setSessions((current) => [session, ...current]);
      setActiveSessionId(session.id);
    }

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setThinking(true);

    const { error: userInsertError } = await supabase.from('assistant_messages').insert({ session_id: sessionId, role: 'user', content: trimmed });
    if (userInsertError) {
      setThinking(false);
      return;
    }

    if (sessions.find((session) => session.id === sessionId)?.title === 'New conversation') {
      const newTitle = trimmed.slice(0, 40);
      await supabase.from('assistant_sessions').update({ title: newTitle, updated_at: new Date().toISOString() }).eq('id', sessionId);
      setSessions((current) => current.map((session) => (session.id === sessionId ? { ...session, title: newTitle } : session)));
    } else {
      await supabase.from('assistant_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
    }

    const reply = getAssistantReply(trimmed, articles);

    await new Promise((resolve) => setTimeout(resolve, 450));

    const { data: assistantRow, error: assistantInsertError } = await supabase
      .from('assistant_messages')
      .insert({ session_id: sessionId, role: 'assistant', content: reply.content, sources: reply.sources.length > 0 ? JSON.stringify(reply.sources) : null })
      .select()
      .maybeSingle();

    setThinking(false);

    if (assistantInsertError || !assistantRow) {
      const fallback: ChatMessage = { id: `temp-a-${Date.now()}`, role: 'assistant', content: reply.content, sources: reply.sources, created_at: new Date().toISOString() };
      setMessages((current) => [...current, fallback]);
      return;
    }

    const saved = assistantRow as ChatMessage;
    setMessages((current) => [...current, { ...saved, sources: reply.sources }]);

    setSessions((current) => current.map((session) => (session.id === sessionId ? { ...session, updated_at: new Date().toISOString() } : session)));
  };

  const formatChatTime = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatSessionTime = (date: string) => {
    const minutes = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  };

  return (
    <div className="modal-backdrop chat-backdrop" onClick={onClose}>
      <section className="chat-window" onClick={(event) => event.stopPropagation()}>
        <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="chat-sidebar-header">
            <div className="chat-sidebar-title"><MessageSquare size={16} /> Conversations</div>
            <button className="chat-new-btn" onClick={startNewSession}><Plus size={14} /> New</button>
          </div>
          <div className="chat-session-list">
            {loadingSessions ? (
              <p className="chat-empty-note">Loading conversations...</p>
            ) : sessions.length === 0 ? (
              <p className="chat-empty-note">No conversations yet. Click "New" to start chatting.</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`chat-session-item ${activeSessionId === session.id ? 'active' : ''}`}
                  onClick={() => { setActiveSessionId(session.id); setSidebarOpen(false); }}
                >
                  <MessageSquare size={14} className="chat-session-icon" />
                  <div className="chat-session-text">
                    <strong>{session.title}</strong>
                    <span>{formatSessionTime(session.updated_at)}</span>
                  </div>
                  <button className="chat-session-delete" onClick={(event) => { event.stopPropagation(); void deleteSession(session.id); }} aria-label="Delete conversation">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <div className="chat-main">
          <header className="chat-header">
            <button className="chat-menu-btn" onClick={() => setSidebarOpen((current) => !current)} aria-label="Conversation list">
              <MessageSquare size={17} />
            </button>
            <div className="chat-header-title">
              <span className="chat-avatar"><Sparkles size={16} /></span>
              <div>
                <strong>Relay Assistant</strong>
                <span>Your guide to the Relay support workspace</span>
              </div>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close assistant"><X size={18} /></button>
          </header>

          <div className="chat-thread" ref={threadRef}>
            {messages.length === 0 && !loadingMessages ? (
              <div className="chat-welcome">
                <span className="chat-welcome-icon"><Sparkles size={26} /></span>
                <h2>Hi! I'm the Relay Assistant</h2>
                <p>Ask me anything about how Relay works — tickets, replies, statuses, channels, analytics, automations, notifications, and more. I also search your approved knowledge base for customer-question answers.</p>
                <div className="chat-suggestions">
                  {suggestedQuestions.map((question) => (
                    <button key={question} className="chat-suggestion-chip" onClick={() => void send(question)}>{question}</button>
                  ))}
                </div>
              </div>
            ) : loadingMessages ? (
              <div className="chat-welcome"><p>Loading messages...</p></div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`chat-bubble-wrap ${message.role}`}>
                  <span className="chat-bubble-avatar">
                    {message.role === 'assistant' ? <Sparkles size={13} /> : <Bot size={13} />}
                  </span>
                  <div className="chat-bubble">
                    <p className="chat-bubble-text">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="chat-sources">
                        <span className="chat-sources-label"><Check size={11} /> Sources</span>
                        {message.sources.map((source) => (
                          <span key={source.title} className="chat-source-tag">{source.title} · {source.category}</span>
                        ))}
                      </div>
                    )}
                    <span className="chat-bubble-time">{formatChatTime(message.created_at)}</span>
                  </div>
                </div>
              ))
            )}
            {thinking && (
              <div className="chat-bubble-wrap assistant">
                <span className="chat-bubble-avatar"><Sparkles size={13} /></span>
                <div className="chat-bubble chat-typing">
                  <i /><i /><i />
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about Relay, or a common customer question..."
              rows={1}
            />
            <button className="chat-send-btn" onClick={() => void send(input)} disabled={!input.trim() || thinking}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
