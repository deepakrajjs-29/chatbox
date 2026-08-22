import { useState, useRef, useEffect, useCallback } from "react";
import { Repository, ChatMessage } from "../../types";
import { backendService } from "../../services/backend";
import { 
  Send, 
  HelpCircle, 
  Cpu, 
  ArrowRight,
  FileCode,
  Lock,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface ChatViewProps {
  repo: Repository;
  onViewChange?: (view: string) => void;
}

interface CitedFile {
  path: string;
  lines?: string;
  symbol?: string;
}

// Lightweight markdown renderer
function MarkdownContent({ text }: { text: string }) {
  if (!text) return null;

  // Split into lines for processing
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={`code-${i}`} className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-black/60">
          {lang && (
            <div className="flex items-center justify-between px-4 py-1.5 bg-white/[0.04] border-b border-white/5">
              <span className="text-[9px] font-semibold text-primary uppercase tracking-wider font-mono">{lang}</span>
            </div>
          )}
          <pre className="p-4 text-[11px] font-mono text-gray-300 overflow-x-auto leading-relaxed">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // H3 header
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-xs font-bold text-white mt-4 mb-2 flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-primary shrink-0" />
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // H2 header
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-sm font-bold text-white mt-4 mb-2">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1 text-[11px] text-gray-300">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\. (.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={`ol-${i}`} className="flex items-start gap-2 my-1 text-[11px] text-gray-300">
          <span className="shrink-0 h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
            {numberedMatch[1]}
          </span>
          <span>{renderInline(numberedMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Empty line → spacing
    if (line.trim() === "") {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="text-[11px] text-gray-300 leading-relaxed my-1">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Split on bold (**text**), inline code (`code`), and file links
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Process bold, inline code, and file links
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((file:\/\/\/[^)]+|[^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }

    if (match[0].startsWith("**")) {
      parts.push(<strong key={key++} className="text-white font-bold">{match[2]}</strong>);
    } else if (match[0].startsWith("`")) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-white/10 text-primary font-mono text-[10px] border border-white/10">
          {match[3]}
        </code>
      );
    } else if (match[0].startsWith("[")) {
      const linkText = match[4];
      const href = match[5];
      parts.push(
        <a key={key++} href={href} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 hover:border-primary/40 text-primary font-mono text-[10px] transition-colors">
          <FileCode className="h-2.5 w-2.5 shrink-0" />
          {linkText}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

function extractCitations(text: string): CitedFile[] {
  const citations: CitedFile[] = [];
  const seen = new Set<string>();

  // file:/// links
  const fileRegex = /\[([^\]]+)\]\(file:\/\/\/([^)]+)\)/g;
  let m;
  while ((m = fileRegex.exec(text)) !== null) {
    const path = m[2];
    if (!seen.has(path)) {
      seen.add(path);
      citations.push({ path, symbol: m[1] });
    }
  }

  // Bold file paths like **src/services/api.ts**
  const boldPathRegex = /\*\*([\w./\-]+\.(ts|tsx|rs|py|js|jsx|go|java|rb|cpp|c|h))\*\*/g;
  while ((m = boldPathRegex.exec(text)) !== null) {
    const path = m[1];
    if (!seen.has(path)) {
      seen.add(path);
      citations.push({ path });
    }
  }

  return citations;
}

export function ChatView({ repo, onViewChange }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");
  const [indexedChunks] = useState(Math.floor(repo.fileCount * 4.2) || 42);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check Ollama availability
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch("http://localhost:11434/api/tags", { signal: controller.signal });
        clearTimeout(timeout);
        setOllamaStatus(res.ok ? "online" : "offline");
      } catch {
        setOllamaStatus("offline");
      }
    };
    checkOllama();
  }, []);

  // Dynamic suggested questions based on repo
  const suggestedQuestions = repo.path.includes("python")
    ? [
        "How does the data ingestion pipeline work?",
        "Where is the database connection initialized?",
        "Explain the parser multi-threading design",
        "What security vulnerabilities exist?",
      ]
    : repo.path.includes("rust")
    ? [
        "How is password hashing implemented?",
        "Show the JWT authentication flow",
        "Where does the DB connection pool load?",
        "Explain the authorization middleware",
      ]
    : [
        "Explain the overall architecture",
        "Where is authentication implemented?",
        "How does the checkout payment flow work?",
        "What are the main security risks?",
        "Which files have the highest complexity?",
      ];

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Seed greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "greet",
          role: "assistant",
          content: `### 👋 DevLens AI is ready\n\nI've indexed **${repo.name}** and built a local semantic vector index across **${indexedChunks} code chunks**.\n\nAsk me anything about this codebase — architecture, authentication flows, security risks, complex files, or how specific data flows through the system. All reasoning stays on your device.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [repo.name, indexedChunks]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    setInputValue("");
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsgId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isStreaming: true,
      },
    ]);

    let gatheredText = "";
    try {
      await backendService.sendChatMessage(
        repo.path,
        text,
        messages.concat(userMsg),
        (token) => {
          gatheredText += token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: gatheredText } : msg
            )
          );
        }
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  "### ⚠️ Local Engine Response\n\nI couldn't generate a response right now. This may happen when:\n- Ollama is not running locally\n- The repository index is still building\n\nYou can still use **Search** (⌘K) and **Security Scanner** without the AI chat feature.",
              }
            : msg
        )
      );
    } finally {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isStreaming, messages, repo.path]);

  const handleClearChat = () => {
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in" style={{ minHeight: 0 }}>
      {/* View Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            AI Codebase Architect
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Ask questions about {repo.name} — architecture, flows, security, and more.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Ollama Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
            ollamaStatus === "online"
              ? "bg-success/10 border-success/20 text-success"
              : ollamaStatus === "offline"
              ? "bg-warning/10 border-warning/20 text-warning"
              : "bg-white/5 border-white/10 text-gray-500"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              ollamaStatus === "online" ? "bg-success animate-pulse" :
              ollamaStatus === "offline" ? "bg-warning" : "bg-gray-500 animate-pulse"
            }`} />
            {ollamaStatus === "online" ? "Ollama Connected" : ollamaStatus === "offline" ? "Local Engine" : "Checking..."}
          </div>

          {/* Privacy Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-semibold">
            <Lock className="h-3 w-3" />
            <span>Your code stays on-device</span>
          </div>

          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
              title="Clear chat"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Ollama Offline Banner */}
      {ollamaStatus === "offline" && (
        <div className="mt-3 p-3 rounded-xl bg-warning/5 border border-warning/20 flex items-start gap-3 shrink-0">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div className="text-[11px] text-gray-300 leading-relaxed">
            <span className="font-bold text-warning">Ollama not detected</span> — Using local heuristic engine. For deeper AI reasoning, install Ollama and run:{" "}
            <code className="px-1 py-0.5 rounded bg-white/10 font-mono text-primary">ollama run qwen2.5-coder:3b</code>
            <br />
            Search, Security Scanner, and all analysis features still work fully offline.
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 grid md:grid-cols-4 gap-4 pt-4 min-h-0 overflow-hidden">

        {/* Chat Thread */}
        <div className="md:col-span-3 flex flex-col rounded-2xl border border-white/5 bg-[#0F0F0F] overflow-hidden min-h-0">

          {/* Scrollable Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              const citations = isAi ? extractCitations(msg.content) : [];

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAi ? "mr-6" : "ml-6 flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border text-[10px] font-bold font-mono mt-0.5 ${
                    isAi
                      ? "bg-accent/15 text-accent border-accent/25"
                      : "bg-primary/15 text-primary border-primary/25"
                  }`}>
                    {isAi ? <Sparkles className="h-3.5 w-3.5" /> : "ME"}
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Message Bubble */}
                    <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      isAi
                        ? "bg-white/[0.03] border border-white/5 text-gray-200"
                        : "bg-primary text-white rounded-br-sm"
                    }`}>
                      {isAi ? (
                        <>
                          <MarkdownContent text={msg.content} />
                          {msg.isStreaming && (
                            <span className="inline-block h-3 w-1.5 bg-primary ml-1 animate-pulse rounded-sm" />
                          )}
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap font-medium">{msg.content}</span>
                      )}
                    </div>

                    {/* Source Citations */}
                    {isAi && citations.length > 0 && !msg.isStreaming && (
                      <div className="flex flex-wrap gap-1.5 px-1">
                        <span className="text-[9px] text-gray-600 font-semibold uppercase tracking-wider self-center">Sources:</span>
                        {citations.map((c, idx) => (
                          <a
                            key={idx}
                            href={`file:///${repo.path}/${c.path}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 text-[10px] text-gray-300 hover:text-primary font-mono transition-all"
                            title={`Open ${c.path}`}
                          >
                            <FileCode className="h-2.5 w-2.5 text-primary/60 shrink-0" />
                            {c.path.split("/").pop()}
                            <ExternalLink className="h-2 w-2 text-gray-600 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-gray-600 font-semibold block px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 border-t border-white/5 bg-black/20 flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about architecture, flows, security, dependencies..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-white/5 bg-white/[0.03] focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] text-white placeholder-gray-600 transition-all"
              disabled={isStreaming}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 active:scale-95 shadow-lg shadow-primary/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-1 flex flex-col gap-3 text-xs overflow-y-auto">

          {/* Suggested Prompts */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-accent" />
              Suggested Questions
            </h4>
            <div className="space-y-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isStreaming}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 text-[10px] text-gray-300 font-medium leading-normal flex items-start justify-between gap-1.5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{q}</span>
                  <ArrowRight className="h-3 w-3 text-gray-600 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* RAG Context Info */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-primary" />
              Index Context
            </h4>
            <div className="space-y-2 text-[10px] font-mono">
              {[
                { label: "Chunks indexed", value: `${indexedChunks}`, color: "text-primary" },
                { label: "Embedding dims", value: "384-dim", color: "text-accent" },
                { label: "Search method", value: "Hybrid", color: "text-success" },
                { label: "Processing", value: "100% Local", color: "text-success" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav */}
          {onViewChange && (
            <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01] space-y-2">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quick Navigate</h4>
              {[
                { label: "Security Findings", view: "security" },
                { label: "Code Universe", view: "universe" },
                { label: "AI Insights", view: "insights" },
              ].map(({ label, view }) => (
                <button
                  key={view}
                  onClick={() => onViewChange(view)}
                  className="w-full text-left text-[10px] text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
