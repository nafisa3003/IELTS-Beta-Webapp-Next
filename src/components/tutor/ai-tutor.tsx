"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Bot,
  Send,
  Loader2,
  Wifi,
  WifiOff,
  Hand,
  PenLine,
  Mic,
  BookOpen,
  HelpCircle,
  Globe,
  AlertTriangle,
  X,
} from "lucide-react";

type ChatMsg = {
  id: string;
  role: "user" | "bot";
  content: string;
  isThinking?: boolean;
};

type QuickChip = {
  label: string;
  prompt: string;
  icon: React.ElementType;
};

const QUICK_CHIPS: QuickChip[] = [
  { label: "Task 2 tips", prompt: "How do I improve my Writing Task 2 band score?", icon: PenLine },
  { label: "Speaking Part 2", prompt: "What are common mistakes in Speaking Part 2?", icon: Mic },
  { label: "Vocab for essays", prompt: "Give me 5 academic vocabulary words for environment essays", icon: BookOpen },
  { label: "Academic vs General", prompt: "What is the difference between Academic and General IELTS?", icon: HelpCircle },
  { label: "Test dates & fees", prompt: "What are the latest IELTS test dates and fees?", icon: Globe },
];

function makeThreadId(userId: string) {
  const today = new Date();
  const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;
  return `user_${userId}_${ymd}`;
}

// Keeps LLM/grading markdown (bold headers, bullet lists, emphasis) tight
// and consistent with the chat bubble's existing font size/line-height,
// instead of the default browser markdown spacing which looks too loose
// inside a small chat bubble.
const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  h1: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-1 text-base font-bold">{children}</p>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-1 text-base font-bold">{children}</p>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => <p className="mb-1 font-bold">{children}</p>,
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded px-1 py-0.5 text-xs" style={{ background: "var(--mist)" }}>
      {children}
    </code>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline">
      {children}
    </a>
  ),
};

export default function AiTutor({ userId, firstName }: { userId: string; firstName: string }) {
  const threadId = useRef(makeThreadId(userId)).current;
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "bot",
      content: `Hi ${firstName}! I'm your IELTS AI tutor, powered by LangGraph and Groq. I can help with Writing Task 2 feedback, vocabulary, grammar, test strategy, and I can search the web for the latest IELTS info. What would you like help with?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [showOfflineNotice, setShowOfflineNotice] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkStatus() {
      try {
        const res = await fetch("/api/tutor/health", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setOnline(Boolean(data.online));
      } catch {
        if (!cancelled) setOnline(false);
      }
    }
    checkStatus();
    const interval = setInterval(checkStatus, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
      { id: "thinking", role: "bot", content: "Thinking…", isThinking: true },
    ]);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, thread_id: threadId }),
      });
      const data = await res.json();
      setMessages((prev) => {
        const withoutThinking = prev.filter((m) => m.id !== "thinking");
        const reply =
          data.reply ??
          (data.detail ? `Engine error: ${data.detail}` : "No response from AI. Please try again.");
        return [...withoutThinking, { id: crypto.randomUUID(), role: "bot", content: reply }];
      });
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "thinking"),
        {
          id: crypto.randomUUID(),
          role: "bot",
          content: "Could not reach the AI Tutor server. Make sure the FastAPI engine is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
            style={{ background: "var(--teal)" }}
          >
            <Bot className="h-5 w-5" style={{ color: "var(--white)" }} />
          </span>
          <div>
            <h1 className="font-[var(--font-display)] text-xl font-bold" style={{ color: "var(--ink)" }}>
              AI Tutor
            </h1>
            <p className="text-sm" style={{ color: "var(--slate)" }}>
              Powered by LangGraph + Groq + Tavily Search (Live)
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-medium"
          style={{
            background: online ? "var(--success-soft)" : "var(--danger-soft)",
            color: online ? "var(--success)" : "var(--danger)",
          }}
        >
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online === null ? "Connecting…" : online ? "AI Tutor online" : "AI Tutor offline"}
        </div>
      </div>

      {/* Offline notice — the FastAPI engine is deployed on a free-tier host and
          currently crashes / fails to start there due to its memory limit, so
          the health check reports offline. Works fully when run locally. */}
      <AnimatePresence initial={false}>
        {online === false && showOfflineNotice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2.5 overflow-hidden rounded-[var(--radius-md)] px-4 py-3 text-sm"
            style={{ background: "var(--warning-soft)", color: "var(--warning)" }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 leading-relaxed">
              AI Tutor is offline on this deployed demo — its backend runs on a free-tier host
              that doesn't have enough memory to keep the engine running. It works fully when
              run locally.
            </p>
            <button
              onClick={() => setShowOfflineNotice(false)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <div
        className="flex flex-col rounded-[var(--radius-lg)] p-4"
        style={{ background: "var(--paper)", boxShadow: "var(--shadow-card)" }}
      >
        <div ref={scrollRef} className="flex max-h-[480px] min-h-[320px] flex-col gap-3 overflow-y-auto p-2">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] rounded-[var(--radius-lg)] px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: "var(--teal)", color: "var(--white)", borderBottomRightRadius: 6 }
                      : {
                          background: "var(--white)",
                          color: "var(--ink)",
                          borderBottomLeftRadius: 6,
                          boxShadow: "var(--shadow-card)",
                        }
                  }
                >
                  {m.role === "bot" && m.id === "welcome" && (
                    <Hand className="mr-1.5 mb-0.5 inline h-4 w-4" style={{ color: "var(--xp)" }} />
                  )}
                  {m.isThinking ? (
                    <span className="inline-flex items-center gap-2" style={{ color: "var(--slate)" }}>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Thinking…
                    </span>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={markdownComponents}
                    >
                      {m.content}
                    </ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input row */}
        <div className="mt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask anything about IELTS…"
            className="flex-1 rounded-[var(--radius-pill)] border px-4 py-2.5 text-sm outline-none focus:ring-2"
            style={{
              background: "var(--white)",
              color: "var(--ink)",
              borderColor: "var(--mist)",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-1.5 rounded-[var(--radius-pill)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ background: "var(--teal)", color: "var(--white)" }}
          >
            Send
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_CHIPS.map(({ label, prompt, icon: Icon }) => (
          <button
            key={label}
            onClick={() => sendMessage(prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-2 text-xs font-medium transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "var(--white)", color: "var(--slate)", boxShadow: "var(--shadow-card)" }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: "var(--teal)" }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
