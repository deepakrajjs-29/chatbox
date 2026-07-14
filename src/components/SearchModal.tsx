import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  FileCode, 
  X, 
  CornerDownLeft, 
  Compass, 
  Network, 
  Map, 
  AlertTriangle, 
  Lock, 
  MessageSquare, 
  Settings, 
  Activity,
  Sparkles,
  BarChart3,
  Orbit,
  GitBranch
} from "lucide-react";
import { backendService } from "../services/backend";

interface SearchResultItem {
  chunk_id: string;
  file_path: string;
  similarity_score: number;
  source_code: string;
  start_line: number;
  end_line: number;
  name: string;
  type: string;
  language: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoPath: string;
  onNavigate?: (view: string) => void;
}

interface CommandItem {
  name: string;
  viewId: string;
  icon: any;
  description: string;
}

export function SearchModal({ isOpen, onClose, repoPath, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Query search handler
  useEffect(() => {
    if (!query.trim() || query.startsWith(">")) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const hits = await backendService.semanticSearch(repoPath, query);
        setResults(hits);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query, repoPath]);

  // Commands List
  const commands: CommandItem[] = [
    { name: "Overview", viewId: "overview", icon: BarChart3, description: "Go to overview analytics dashboard" },
    { name: "Code Universe", viewId: "universe", icon: Orbit, description: "Visualize architecture galaxy and heatmaps" },
    { name: "AI Insights", viewId: "insights", icon: Sparkles, description: "View autonomous health scores and security details" },
    { name: "Git Evolution", viewId: "git", icon: GitBranch, description: "Check logs timelines and change impact risk trees" },
    { name: "Architecture Explorer", viewId: "architecture", icon: Compass, description: "Review folder architectures summaries" },
    { name: "Dependency Graph", viewId: "dependencies", icon: Network, description: "Visualize imports coupling clusters" },
    { name: "Learning Roadmap", viewId: "roadmap", icon: Map, description: "Access AI curated learning milestones" },
    { name: "Bug Hotspots", viewId: "hotspots", icon: AlertTriangle, description: "Locate high-risk regression modules" },
    { name: "Security Scanner", viewId: "security", icon: Lock, description: "Audit credentials leaks and insecure APIs" },
    { name: "Local AI Chat", viewId: "chat", icon: MessageSquare, description: "Discuss codebase queries with offline LLMs" },
    { name: "Performance Stats", viewId: "performance", icon: Activity, description: "Analyze memory metrics and vector stores usage" },
    { name: "Settings Control", viewId: "settings", icon: Settings, description: "Configure ignore-directories and embedding parameters" }
  ];

  // Filter commands by query
  const filteredCommands = query.startsWith(">")
    ? commands.filter(c => c.name.toLowerCase().includes(query.slice(1).trim().toLowerCase()))
    : commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleCommandClick = (viewId: string) => {
    if (onNavigate) {
      onNavigate(viewId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-[10vh] animate-fade-in">
      
      {/* Search Container Card */}
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0F0F0F] shadow-2xl flex flex-col max-h-[70vh] overflow-hidden animate-scale-in">
        
        {/* Input Bar */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3 shrink-0">
          <Search className="h-5 w-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type code query to search, or start with '>' to trigger commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-gray-500 font-medium font-sans"
          />
          {loading ? (
            <div className="h-4.5 w-4.5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          ) : query ? (
            <button 
              onClick={() => setQuery("")}
              className="p-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Results / Commands Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* SHOW COMMANDS LIST */}
          {(query.startsWith(">") || query === "") ? (
            <div className="space-y-2">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pl-1 mb-3">
                {query.startsWith(">") ? "Filtered System Commands" : "System Navigation Commands"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.viewId}
                      onClick={() => handleCommandClick(cmd.viewId)}
                      className="flex items-center gap-3 p-3 text-left rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 transition-all select-none active:scale-[0.98]"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/10">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">{cmd.name}</div>
                        <div className="text-[9px] text-gray-500 font-medium truncate">{cmd.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              {loading ? "Computing similarity scores..." : "No semantic matches found."}
            </div>
          ) : (
            results.map((hit) => (
              <div 
                key={hit.chunk_id}
                className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all space-y-3"
              >
                {/* Header: File path and similarity score */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0 font-mono text-[11px]">
                    <FileCode className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-gray-300 font-bold truncate">{hit.file_path}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500 font-medium capitalize">
                      {hit.type}: {hit.name}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary shrink-0">
                    {Math.round(hit.similarity_score * 100)}% match
                  </span>
                </div>

                {/* Snippet Preview */}
                <div className="relative rounded-lg border border-white/5 bg-black/60 p-3 font-mono text-[10px] text-gray-400 overflow-x-auto shadow-inner leading-relaxed">
                  <div className="absolute right-2.5 top-2.5 text-[8px] text-gray-600 font-semibold select-none">
                    Lines {hit.start_line} - {hit.end_line}
                  </div>
                  <pre className="text-gray-300 font-medium">
                    <code>{hit.source_code}</code>
                  </pre>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/30 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-semibold shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span>ESC to close</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <CornerDownLeft className="h-3 w-3" />
              to select
            </span>
          </div>
          <span>100% Local Unified Command Palette</span>
        </div>

      </div>
    </div>
  );
}
