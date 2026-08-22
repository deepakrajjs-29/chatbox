import { GitBranch, FileText, WifiOff, Search, Lock } from "lucide-react";

interface HeaderProps {
  repoPath: string;
  branchName: string;
  repoName: string;
  onSearchTrigger: () => void;
  onReportTrigger?: () => void;
}

export function Header({ repoPath, branchName, repoName, onSearchTrigger, onReportTrigger }: HeaderProps) {
  return (
    <header className="h-14 border-b border-white/5 bg-[#0F0F0F] px-6 flex items-center justify-between shrink-0 select-none">

      {/* Directory Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-400 min-w-0">
        <span className="font-semibold text-white truncate max-w-[150px]">{repoName}</span>
        <span className="text-gray-600">/</span>
        <span className="font-mono text-[10px] text-gray-500 truncate max-w-[200px]" title={repoPath}>
          {repoPath}
        </span>
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Privacy indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] text-primary font-bold uppercase tracking-wide">
          <Lock className="h-3 w-3" />
          <span>Local Only</span>
        </div>

        {/* Connection status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-gray-400 font-semibold uppercase tracking-wide">
          <WifiOff className="h-3 w-3 text-gray-500" />
          <span>Offline Mode</span>
        </div>

        {/* Branch Info */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1F2937]/50 border border-white/5 text-[10px] text-white font-semibold font-mono">
          <GitBranch className="h-3 w-3 text-success" />
          <span>{branchName}</span>
        </div>

        {/* Search button */}
        <button
          onClick={onSearchTrigger}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all active:scale-[0.98]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search (⌘K)</span>
        </button>

        {/* Report Button */}
        <button
          onClick={onReportTrigger}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 border border-transparent text-xs font-bold text-white shadow-lg shadow-primary/15 transition-all active:scale-[0.98]"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Generate Report</span>
        </button>
      </div>

    </header>
  );
}
