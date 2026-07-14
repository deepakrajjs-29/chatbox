import { useState, useRef, useEffect } from "react";
import { Repository, ChatMessage } from "../../types";
import { backendService } from "../../services/backend";
import { 
  Send, 
  HelpCircle, 
  Cpu, 
  ArrowRight,
  FileCode
} from "lucide-react";

interface ChatViewProps {
  repo: Repository;
}

export function ChatView({ repo }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on repository
  const suggestedQuestions = repo.path === "/projects/python-data-engine" 
    ? ["How does the ingestion pipeline work?", "Explain python-data-engine schema db settings", "Show parser multi-threading design"]
    : repo.path === "/projects/rust-auth-service" 
      ? ["How password hashing is implemented?", "Show authentication endpoint files", "Where does the DB connection pool load?"]
      : ["Explain authentication flow", "Where is the JWT token verified?", "Explain payment flow checkout logic"];

  // Scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Seed chat with greetings
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "greet",
          role: "assistant",
          content: `Hi! I have indexed **${repo.name}** completely. I have built the symbol tree and computed vector embeddings locally.\n\nAsk me anything about the architecture, security hotspots, or how a specific flow is implemented. What would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [repo, messages.length]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    
    setInputValue("");
    const userMsgId = Math.random().toString();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    // Add user message
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsgId = Math.random().toString();
    // Add temporary assistant placeholder
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true
    }]);

    let gatheredText = "";
    try {
      await backendService.sendChatMessage(
        repo.path,
        text,
        messages.concat(userMsg),
        (token) => {
          gatheredText += token;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMsgId 
              ? { ...msg, content: gatheredText } 
              : msg
          ));
        }
      );
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, content: "Error: Local Ollama inference failed to stream response chunks." } 
          : msg
      ));
    } finally {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, isStreaming: false } 
          : msg
      ));
      setIsStreaming(false);
    }
  };

  // Helper to format local markdown files and links
  const formatMessageContent = (text: string) => {
    // Regex for file:/// links
    const fileLinkRegex = /\[([^\]]+)\]\(file:\/\/\/([^\)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = fileLinkRegex.exec(text)) !== null) {
      const matchIdx = match.index;
      // Add text before match
      if (matchIdx > lastIndex) {
        parts.push(<span key={lastIndex}>{text.substring(lastIndex, matchIdx)}</span>);
      }
      
      const linkText = match[1];
      const filePath = match[2];
      
      parts.push(
        <a 
          key={matchIdx} 
          href={`file:///${filePath}`} 
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 hover:border-primary/30 text-primary font-mono text-[11px] transition-colors"
          title={`Click to open local ${filePath}`}
        >
          <FileCode className="h-3 w-3 shrink-0 text-primary/70" />
          {linkText}
        </a>
      );
      
      lastIndex = fileLinkRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="h-full flex flex-col animate-fade-in min-h-[440px]">
      
      {/* View Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Repository Local AI</h2>
          <p className="text-xs text-gray-400 mt-1">
            Secure offline Q&A powered by local embeddings search.
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] text-accent font-semibold">
          <Cpu className="h-3.5 w-3.5 animate-pulse" />
          <span>Local Engine RAG</span>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-4 gap-4 py-4 min-h-0">
        
        {/* Chat message board */}
        <div className="md:col-span-3 flex flex-col justify-between glass-panel rounded-2xl border border-white/5 bg-[#0F0F0F] min-h-[360px] overflow-hidden">
          
          {/* Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold font-mono ${
                    isAi 
                      ? "bg-accent/15 text-accent border-accent/25" 
                      : "bg-primary/15 text-primary border-primary/25"
                  }`}>
                    {isAi ? "AI" : "ME"}
                  </div>

                  <div className="space-y-1">
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed font-medium whitespace-pre-wrap ${
                      isAi 
                        ? "bg-white/[0.02] text-gray-200 border border-white/5" 
                        : "bg-primary text-white"
                    }`}>
                      {isAi ? formatMessageContent(msg.content) : msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block h-3 w-1.5 bg-primary ml-1 animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-500 font-semibold block px-1 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef}></div>
          </div>

          {/* Form Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="p-3 border-t border-white/5 bg-black/30 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question about authentication, directories, or imports..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-white/5 bg-white/[0.02] focus:outline-none focus:border-primary text-white"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isStreaming}
              className="p-2 rounded-xl bg-primary hover:bg-primary/95 text-white disabled:opacity-40 disabled:hover:bg-primary transition-all shrink-0 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right side panel: Suggestions */}
        <div className="md:col-span-1 glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4 text-xs">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-accent" />
            Suggested Prompts
          </h4>

          <div className="space-y-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isStreaming}
                className="w-full text-left p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-[11px] text-gray-300 font-medium leading-normal flex items-start justify-between gap-1.5 transition-all group disabled:opacity-50"
              >
                <span>{q}</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-gray-400 leading-relaxed font-mono">
            <span className="font-bold text-gray-300 block mb-1">RAG Context:</span>
            - 42 files indexed<br />
            - LanceDB vectors loaded<br />
            - 100% Local Inference
          </div>
        </div>

      </div>
    </div>
  );
}
