import { 
  BarChart3, 
  Network, 
  Map, 
  FolderGit2, 
  AlertTriangle, 
  Lock, 
  MessageSquare, 
  Settings, 
  LogOut,
  Compass,
  Sparkles,
  GitBranch,
  Orbit,
  Activity
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  repoName: string;
  repoPath: string;
  onCloseRepo: () => void;
}

export function Sidebar({ 
  activeView, 
  onViewChange, 
  repoName, 
  repoPath,
  onCloseRepo 
}: SidebarProps) {
  
  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "universe", label: "Code Universe", icon: Orbit },
    { id: "insights", label: "AI Insights", icon: Sparkles },
    { id: "git", label: "Git Intelligence", icon: GitBranch },
    { id: "architecture", label: "Architecture", icon: Compass },
    { id: "dependencies", label: "Dependency Graph", icon: Network },
    { id: "explorer", label: "Code Explorer", icon: FolderGit2 },
    { id: "roadmap", label: "Learning Roadmap", icon: Map },
    { id: "hotspots", label: "Bug Hotspots", icon: AlertTriangle, badge: "2" },
    { id: "security", label: "Security Scanner", icon: Lock, badge: "2", badgeColor: "bg-danger/10 text-danger border-danger/20" },
    { id: "chat", label: "Local AI Chat", icon: MessageSquare, highlight: true },
    { id: "performance", label: "Performance", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="w-64 border-r border-white/5 bg-[#0F0F0F] flex flex-col h-full shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-xs text-white">
            DL
          </div>
          <span className="font-bold tracking-tight text-sm">DevLens <span className="text-primary font-medium">AI</span></span>
        </div>
      </div>

      {/* Active Repo Stats */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col min-w-0">
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Active Repository</span>
        <span className="text-xs font-bold text-white truncate mt-1" title={repoName}>
          {repoName}
        </span>
        <span className="text-[9px] text-gray-400 truncate mt-0.5 font-mono" title={repoPath}>
          {repoPath}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : item.highlight 
                    ? "text-accent border border-transparent hover:bg-accent/5"
                    : "text-gray-400 hover:text-white border border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-primary" : item.highlight ? "text-accent" : "text-gray-400 group-hover:text-white"
                }`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {/* Badges / Indicators */}
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                  item.badgeColor || "bg-primary/10 text-primary border-primary/20"
                }`}>
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-accent relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Close Project Button */}
      <div className="p-3 border-t border-white/5 bg-[#0A0A0A]/50">
        <button
          onClick={onCloseRepo}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
        >
          <LogOut className="h-4 w-4 text-gray-500" />
          <span>Close Project</span>
        </button>
      </div>

    </div>
  );
}
