import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FolderOpen, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Terminal, 
  Cpu, 
  Sparkles,
  Database,
  Lock,
  Wifi,
  WifiOff
} from "lucide-react";
import { RecentRepo } from "../types";
import { backendService } from "../services/backend";

interface LandingPageProps {
  recentRepos: RecentRepo[];
  onSelectRepo: (path: string) => void;
  onDeleteRecent: (path: string) => void;
  isRecentLoading: boolean;
}

export function LandingPage({ 
  recentRepos, 
  onSelectRepo, 
  onDeleteRecent,
  isRecentLoading 
}: LandingPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "online" | "offline">("checking");

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

  // File Picker Click
  const handleSelectFolder = async () => {
    setErrorMessage(null);
    try {
      const folder = await backendService.pickFolder();
      if (folder) {
        onSelectRepo(folder.path);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to open local directory picker.");
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // In web environment, we can extract the name of the folder if available, 
    // or just simulate loading a dropped folder.
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Simulate directory load
      const path = `/projects/${files[0].name || "dropped-repository"}`;
      onSelectRepo(path);
    } else {
      // System folders dropped sometimes do not list in files
      onSelectRepo("/projects/custom-dropped-repo");
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-accent/5 blur-[150px]"></div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-lg">
            DL
          </div>
          <span className="font-bold tracking-tight text-lg">DevLens <span className="text-primary font-medium">AI</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Privacy badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/15 text-[10px] text-primary font-semibold">
            <Lock className="h-3 w-3" />
            <span>Your code stays on-device</span>
          </div>
          {/* Ollama status */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${
            ollamaStatus === "online"
              ? "bg-success/10 border-success/20 text-success"
              : ollamaStatus === "offline"
              ? "bg-white/5 border-white/10 text-gray-400"
              : "bg-white/5 border-white/10 text-gray-500"
          }`}>
            {ollamaStatus === "online" ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : ollamaStatus === "offline" ? (
              <WifiOff className="h-3.5 w-3.5" />
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            <span>{
              ollamaStatus === "online" ? "Ollama: Connected" :
              ollamaStatus === "offline" ? "Ollama: Offline (local engine)" :
              "Checking Ollama..."
            }</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg 
              className="h-4 w-4 fill-current" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center relative z-10">
        
        {/* Tagline */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Understand Any Codebase.<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Entirely On Your Machine.
              </span>
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto text-base">
              Local repository parsing, circular dependency maps, learning roadmaps, complexity scoring, and RAG chat. Absolutely offline. Zero data leaks.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Left panel: Drag drop & pick folder */}
          <div className="md:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`glass-panel rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-dashed text-center min-h-[300px] cursor-pointer transition-all duration-300 relative ${
                isDragging 
                  ? "border-primary bg-primary/5 scale-[1.01]" 
                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
              }`}
              onClick={handleSelectFolder}
            >
              {/* Dynamic Overlay Glowing Lights */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-300 mb-6 group-hover:scale-110 transition-transform">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Select your project directory</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Drag & drop your repository folder here, or click to browse local files
              </p>
              
              <button className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                Browse Repository
                <ArrowRight className="h-4 w-4" />
              </button>
              
              {errorMessage && (
                <div className="mt-4 text-xs text-danger font-medium">{errorMessage}</div>
              )}
            </motion.div>

            {/* Quick pre-loaded templates for web demo */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-accent" />
                Or Explore Pre-analyzed Templates
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => onSelectRepo("/projects/react-ecom-client")}
                  className="glass-panel text-left p-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all group active:scale-[0.98]"
                >
                  <span className="text-xs text-primary font-medium block mb-1">React Store</span>
                  <span className="text-[10px] text-gray-400 block truncate">TypeScript Frontend</span>
                </button>
                <button
                  onClick={() => onSelectRepo("/projects/python-data-engine")}
                  className="glass-panel text-left p-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all group active:scale-[0.98]"
                >
                  <span className="text-xs text-accent font-medium block mb-1">Data Pipeline</span>
                  <span className="text-[10px] text-gray-400 block truncate">Python Classifiers</span>
                </button>
                <button
                  onClick={() => onSelectRepo("/projects/rust-auth-service")}
                  className="glass-panel text-left p-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all group active:scale-[0.98]"
                >
                  <span className="text-xs text-success font-medium block mb-1">Rust Microservice</span>
                  <span className="text-[10px] text-gray-400 block truncate">Cargo Server Auth</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Recent Repositories */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-semibold tracking-wider text-gray-500 uppercase flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Recent Repositories
            </h4>

            {isRecentLoading ? (
              <div className="space-y-3">
                {[1, 2].map(n => (
                  <div key={n} className="h-16 w-full rounded-xl bg-white/[0.02] border border-white/5 animate-pulse"></div>
                ))}
              </div>
            ) : recentRepos.length === 0 ? (
              <div className="glass-panel rounded-xl p-8 text-center border border-white/5 bg-white/[0.01]">
                <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No project history found</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {recentRepos.map((repo) => (
                  <motion.div
                    key={repo.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group glass-panel flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div 
                      onClick={() => onSelectRepo(repo.path)}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                        {repo.name}
                      </h5>
                      <span className="text-[10px] text-gray-500 font-mono truncate block mt-0.5 mb-1.5">
                        {repo.path}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              repo.language === "TypeScript" ? "bg-primary" : 
                              repo.language === "Python" ? "bg-accent" : "bg-success"
                            }`}></span>
                            {repo.language}
                          </span>
                        )}
                        <span>{formatSize(repo.sizeBytes)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecent(repo.path);
                      }}
                      className="p-1.5 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Cpu className="h-4 w-4" />
            </div>
            <h5 className="text-xs font-semibold text-white mb-1">Local AI Reasoning</h5>
            <p className="text-[11px] text-gray-500 max-w-[200px]">Run LLMs locally on your own GPU/CPU without APIs</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-3">
              <Database className="h-4 w-4" />
            </div>
            <h5 className="text-xs font-semibold text-white mb-1">Private Vector Indexes</h5>
            <p className="text-[11px] text-gray-500 max-w-[200px]">Embeddings are calculated and stored locally in LanceDB</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success mb-3">
              <Terminal className="h-4 w-4" />
            </div>
            <h5 className="text-xs font-semibold text-white mb-1">Tree-sitter Parsing</h5>
            <p className="text-[11px] text-gray-500 max-w-[200px]">Fast parsing algorithms extract code relationships</p>
          </div>
        </div>
      </main>
    </div>
  );
}
