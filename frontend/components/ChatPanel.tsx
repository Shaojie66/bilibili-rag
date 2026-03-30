"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatApi, knowledgeApi, KnowledgeStats, API_BASE_URL } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ bvid: string; title: string; url: string }>;
}

interface Props {
  statsKey?: number;
  sessionId?: string;
  folderIds?: number[];
}

export default function ChatPanel({ statsKey, sessionId, folderIds }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const marker = "[[SOURCES_JSON]]";

  // Refs for streaming buffer to avoid state thrashing
  const bufferRef = useRef("");
  const sourcesRef = useRef("");
  const inSourcesRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef(false);
  const assistantIdRef = useRef<string>("");
  // Batch state update using RAF to cap at ~60fps
  const flushBuffer = useCallback(() => {
    if (pendingUpdateRef.current && assistantIdRef.current) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantIdRef.current
            ? { ...m, content: bufferRef.current }
            : m
        )
      );
      pendingUpdateRef.current = false;
    }
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (!pendingUpdateRef.current) {
      pendingUpdateRef.current = true;
      rafRef.current = requestAnimationFrame(flushBuffer);
    }
  }, [flushBuffer]);

  useEffect(() => {
    knowledgeApi.getStats().then(setStats).catch(() => { });
  }, [statsKey]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    const userId = Date.now().toString();
    const assistantId = (Date.now() + 1).toString();
    assistantIdRef.current = assistantId;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: q },
      { id: assistantId, role: "assistant", content: "", sources: [] },
    ]);
    setLoading(true);

    // Reset streaming refs
    bufferRef.current = "";
    sourcesRef.current = "";
    inSourcesRef.current = false;
    pendingUpdateRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/ask/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: q,
          session_id: sessionId,
          folder_ids: folderIds,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("流式接口不可用");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          if (chunk) {
            if (inSourcesRef.current) {
              sourcesRef.current += chunk;
            } else {
              bufferRef.current += chunk;
              const markerIndex = bufferRef.current.indexOf(marker);
              if (markerIndex !== -1) {
                const contentPart = bufferRef.current.slice(0, markerIndex);
                sourcesRef.current = bufferRef.current.slice(markerIndex + marker.length);
                bufferRef.current = contentPart;
                inSourcesRef.current = true;
              }
              // Schedule RAF-batched state update instead of immediate setState
              scheduleFlush();
            }
          }
        }
      }

      // Final flush after stream ends
      if (pendingUpdateRef.current) {
        flushBuffer();
      }

      if (sourcesRef.current) {
        try {
          const parsed = JSON.parse(sourcesRef.current);
          if (Array.isArray(parsed)) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, sources: parsed } : m
              )
            );
          }
        } catch {
          // Ignore parse errors to avoid disrupting main text
        }
      }
    } catch (e) {
      try {
        const res = await chatApi.ask(q, sessionId, folderIds);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: res.answer, sources: res.sources } : m
          )
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `错误: ${err instanceof Error ? err.message : "请求失败"}`,
                }
              : m
          )
        );
      }
    }
    setLoading(false);
  };

  return (
    <div className="panel-inner">
      <div className="panel-header">
        <div>
          <div className="panel-title">对话工作台</div>
          {stats && stats.total_videos > 0 && (
            <div className="panel-subtitle">已收录 {stats.total_videos} 个视频</div>
          )}
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="btn btn-ghost" title="清空">
            清空对话
          </button>
        )}
      </div>

      <div className="panel-body">
        <div className="chat-scroll">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div>
                <div className="status-pill">检索就绪</div>
                <p className="text-sm text-[var(--muted)] mt-3">把收藏夹变成可提问的知识库</p>
              </div>
              <div className="prompt-grid">
                {[
                  "总结收藏夹里最有价值的内容",
                  "有哪些适合快速复习的系列？",
                  "列出与某个主题相关的视频并给出关键点",
                  "按主题整理我的收藏夹内容",
                  "用一句话概括每个视频的重点",
                  "推荐3个最适合入门的学习视频",
                ].map((q, i) => (
                  <button key={i} onClick={() => setInput(q)} className="prompt-chip">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-window">
              {messages.map((m) => (
                <div key={m.id} className={`message ${m.role}`}>
                  <div className="message-bubble">
                    <ReactMarkdown className="markdown" remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                    {m.sources && m.sources.length > 0 && (
                      <div className="source-list">
                        {m.sources.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="source-link">
                            {s.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-bubble">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      <div className="panel-footer">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="输入问题..."
            className="input"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="btn btn-primary">
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
