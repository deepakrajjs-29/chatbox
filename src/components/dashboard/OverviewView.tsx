import { Repository } from "../../types";
import { 
  FileCode2, 
  Layers, 
  GitCommit, 
  ShieldAlert, 
  Cpu, 
  Box, 
  Binary,
  ArrowRight
} from "lucide-react";

interface OverviewViewProps {
  repo: Repository;
  onViewChange: (view: string) => void;
}

export function OverviewView({ repo, onViewChange }: OverviewViewProps) {
  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Codebase Intelligence Lens</h2>
        <p className="text-xs text-gray-400 mt-1">
          Complete static analysis and structural mappings for <span className="font-semibold text-primary">{repo.name}</span>.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Repository Size</span>
            <Binary className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-white">{formatSize(repo.sizeBytes)}</h3>
          <p className="text-[9px] text-gray-400 mt-1">Parsed in 1.8 seconds</p>
        </div>

        <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Files / Folders</span>
            <FileCode2 className="h-4 w-4 text-accent" />
          </div>
          <h3 className="text-lg font-bold text-white">{repo.fileCount} / {repo.foldersCount}</h3>
          <p className="text-[9px] text-gray-400 mt-1">Excludes ignored directories</p>
        </div>

        <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Commit Count</span>
            <GitCommit className="h-4 w-4 text-success" />
          </div>
          <h3 className="text-lg font-bold text-white">{repo.commitCount}</h3>
          <p className="text-[9px] text-gray-400 mt-1">Active branch: <span className="font-semibold font-mono text-success">{repo.branch}</span></p>
        </div>

        <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Security Risks</span>
            <ShieldAlert className="h-4 w-4 text-danger" />
          </div>
          <h3 className="text-lg font-bold text-white">2 Secrets</h3>
          <p className="text-[9px] text-danger/80 mt-1">Immediate review required</p>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
        <h4 className="text-xs font-semibold text-gray-400">Language Breakdown</h4>
        
        {/* Horizontal Progress bar segments */}
        <div className="h-2.5 w-full rounded-full bg-neutral-900 overflow-hidden flex">
          {repo.languages.map((lang) => (
            <div 
              key={lang.name} 
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ 
                width: `${lang.percentage}%`,
                backgroundColor: lang.color
              }}
              title={`${lang.name}: ${lang.percentage}%`}
            ></div>
          ))}
        </div>
        
        {/* Color Legend dots */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
          {repo.languages.map((lang) => (
            <div key={lang.name} className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: lang.color }}></span>
              <span>{lang.name}</span>
              <span className="text-gray-500 font-semibold">{lang.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row details: Frameworks & Architecture Style */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Card: Architectural Detection */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4.5 w-4.5 text-primary" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Architectural Pattern</h4>
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">
              {repo.architectureStyle || "Layered Components"}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              DevLens detected structured imports organizing files into specific layout, controllers, and services tiers. Click to explore the layout graph.
            </p>
          </div>
          
          <button 
            onClick={() => onViewChange("architecture")}
            className="w-fit flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-white transition-colors mt-4 active:translate-x-0.5"
          >
            Open Architecture Canvas
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Card: Tech Stack Properties */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Box className="h-4.5 w-4.5 text-accent" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Framework & Dependencies</h4>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {repo.frameworks.map((fw) => (
                <span key={fw} className="px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-[10px] text-accent font-semibold">
                  {fw}
                </span>
              ))}
              {repo.packageManager && (
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-semibold font-mono">
                  pkg: {repo.packageManager}
                </span>
              )}
              {repo.buildTool && (
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 font-semibold font-mono">
                  tool: {repo.buildTool}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Codebase initialized with `{repo.packageManager}`. Scanned import headers detect {repo.frameworks.join(", ")} decorators.
            </p>
          </div>

          <button 
            onClick={() => onViewChange("dependencies")}
            className="w-fit flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-white transition-colors mt-4 active:translate-x-0.5"
          >
            Inspect Dependency Relations
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* Row: Quick AI Helper actions */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/25 shrink-0">
            <Cpu className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Ask local DevLens AI Chat</h4>
            <p className="text-[10px] text-gray-400">Query file relations or onboarding paths locally using Qwen2.5-Coder LLM.</p>
          </div>
        </div>
        <button 
          onClick={() => onViewChange("chat")}
          className="px-4 py-1.5 bg-accent hover:bg-accent/95 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
        >
          Start Chat Session
        </button>
      </div>

    </div>
  );
}
