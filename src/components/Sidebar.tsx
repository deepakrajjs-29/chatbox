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
  Activity,
  FileText,
  Shield
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  repoName: string;
  repoPath: string;
  onCloseRepo: () => void;
  securityCount?: number;
  hotspotCount?: number;
}

export function Sidebar({
  activeView,
  onViewChange,
  repoName,
  repoPath,
  onCloseRepo,
  securityCount,
  hotspotCount
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
    {
      id: "hotspots",
      label: "Bug Hotspots",
      icon: AlertTriangle,
      badge: hotspotCount !== undefined ? String(hotspotCount) : undefined,
    },
    {
      id: "security",
      label: "Security Scanner",
      icon: Lock,
      badge: securityCount !== undefined ? String(securityCount) : undefined,
      badgeColor: "bg-danger/10 text-danger border-danger/20",
    },
    { id: "chat", label: "Local AI Chat", icon: MessageSquare, highlight: true },
    { id: "report", label: "Codebase Report", icon: FileText },
    { id: "performance", label: "Performance", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-60 border-r border-white/5 bg-[#0F0F0F] flex flex-col h-full shrink-0 select-none">

      {/* Brand Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-primary/20">
            DL
          </div>
          <span className="font-bold tracking-tight text-sm">DevLens <span className="text-primary font-medium">AI</span></span>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 border border-success/20">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] text-success font-bold">LOCAL</span>
        </div>
      </div>

      {/* Active Repo */}
      <div className="px-3 py-2.5 mx-2 my-2 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col min-w-0">
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Active Repository</span>
        <span className="text-xs font-bold text-white truncate mt-0.5" title={repoName}>
          {repoName}
        </span>
        <span className="text-[9px] text-gray-500 truncate mt-0.5 font-mono" title={repoPath}>
          {repoPath}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
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
                <Icon className={`h-3.5 w-3.5 shrink-0 ${
                  isActive ? "text-primary" : item.highlight ? "text-accent" : "text-gray-400 group-hover:text-white transition-colors"
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {/* Badges */}
              {item.badge && Number(item.badge) > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                  item.badgeColor || "bg-primary/10 text-primary border-primary/20"
                }`}>
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-accent relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Privacy Footer */}
      <div className="px-3 py-2 mx-2 mb-2 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2">
        <Shield className="h-3 w-3 text-primary shrink-0" />
        <span className="text-[9px] text-gray-400 leading-tight">
          Your source code never leaves this device
        </span>
      </div>

      {/* Close Project Button */}
      <div className="p-2 border-t border-white/5 bg-[#0A0A0A]/50">
        <button
          onClick={onCloseRepo}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
        >
          <LogOut className="h-3.5 w-3.5 text-gray-500" />
          <span>Close Project</span>
        </button>
      </div>

    </div>
  );
}
