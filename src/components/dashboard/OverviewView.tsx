import { useState, useEffect } from "react";
import { Repository, RepositoryInsights } from "../../types";
import { backendService } from "../../services/backend";
import {
  BarChart3,
  FileCode2,
  GitCommit,
  ShieldAlert,
  Binary,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  MessageSquare,
  Orbit,
  Activity
} from "lucide-react";

interface OverviewViewProps {
  repo: Repository;
  onViewChange: (view: string) => void;
}

function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? "#22C55E" : score >= 75 ? "#4F8CFF" : score >= 55 ? "#F59E0B" : "#EF4444";
  const label = score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 55 ? "Fair" : "Needs Work";
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="38"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white leading-none">{score}</span>
          <span className="text-[9px] text-gray-500 font-semibold">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold mt-2" style={{ color }}>{label}</span>
      <span className="text-[10px] text-gray-500 font-medium">Codebase Health</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "text-primary",
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  color?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-gray-500";

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] transition-all group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors`}>
          <Icon className={`h-3.5 w-3.5 ${color}`} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-extrabold text-white leading-none">{value}</span>
        {trend && <TrendIcon className={`h-3.5 w-3.5 ${trendColor} mb-0.5`} />}
      </div>
      {sub && <p className="text-[10px] text-gray-500 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

export function OverviewView({ repo, onViewChange }: OverviewViewProps) {
  const [insights, setInsights] = useState<RepositoryInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      try {
        const data = await backendService.getRepositoryInsights(repo.path);
        setInsights(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [repo]);

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Compute health score from insights
  const healthScore = insights
    ? Math.round(insights.health_scores.reduce((s, h) => s + h.score, 0) / insights.health_scores.length)
    : null;

  const securityCount = insights?.security_findings.length ?? 0;
  const criticalCount = insights?.security_findings.filter(f => f.severity === "HIGH").length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Codebase Intelligence
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Complete static analysis for <span className="font-semibold text-primary">{repo.name}</span> on branch{" "}
          <span className="font-mono text-success">{repo.branch}</span>
        </p>
      </div>

      {/* Health Score + Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">

        {/* Health Score Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center md:col-span-1">
          {loading ? (
            <div className="h-28 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : healthScore !== null ? (
            <HealthScoreRing score={healthScore} />
          ) : (
            <div className="text-xs text-gray-500">Unavailable</div>
          )}
        </div>

        {/* Stat Cards Grid */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Repository Size"
            value={formatSize(repo.sizeBytes)}
            sub="Parsed in < 2s"
            icon={Binary}
            color="text-primary"
          />
          <StatCard
            label="Files / Folders"
            value={`${repo.fileCount} / ${repo.foldersCount}`}
            sub="Excl. ignored dirs"
            icon={FileCode2}
            color="text-accent"
          />
          <StatCard
            label="Commits"
            value={repo.commitCount}
            sub={`Branch: ${repo.branch}`}
            icon={GitCommit}
            color="text-success"
            trend="up"
          />
          <StatCard
            label="Security"
            value={securityCount > 0 ? `${securityCount} Issues` : "Clean"}
            sub={criticalCount > 0 ? `${criticalCount} critical` : "No critical findings"}
            icon={ShieldAlert}
            color={securityCount > 0 ? "text-danger" : "text-success"}
            trend={securityCount > 0 ? "down" : "up"}
          />
        </div>
      </div>

      {/* Health Breakdown (from insights) */}
      {!loading && insights && (
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              Health Dimensions
            </h3>
            <button
              onClick={() => onViewChange("insights")}
              className="text-[10px] text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
            >
              Full Report <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {insights.health_scores.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400 font-medium truncate max-w-[120px]">{item.category}</span>
                  <span className={`font-bold tabular-nums ${
                    item.score >= 90 ? "text-success" : item.score >= 70 ? "text-primary" : "text-danger"
                  }`}>{item.score}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      item.score >= 90 ? "bg-success" : item.score >= 70 ? "bg-primary" : "bg-danger"
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language Breakdown */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
        <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
          <Binary className="h-3.5 w-3.5" />
          Language Breakdown
        </h4>
        <div className="h-2.5 w-full rounded-full bg-neutral-900 overflow-hidden flex gap-px">
          {repo.languages.map((lang) => (
            <div
              key={lang.name}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-700"
              style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
              title={`${lang.name}: ${lang.percentage}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {repo.languages.map((lang) => (
            <div key={lang.name} className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
              <span className="font-medium">{lang.name}</span>
              <span className="text-gray-500 font-semibold tabular-nums">{lang.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Frameworks + Architecture */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
          <h4 className="text-xs font-bold text-gray-400">Detected Frameworks</h4>
          <div className="flex flex-wrap gap-2">
            {repo.frameworks.map((fw) => (
              <span
                key={fw}
                className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary"
              >
                {fw}
              </span>
            ))}
          </div>
          {repo.packageManager && (
            <p className="text-[10px] text-gray-500">
              Package manager: <span className="text-gray-300 font-semibold">{repo.packageManager}</span>
              {repo.buildTool && <> · Build: <span className="text-gray-300 font-semibold">{repo.buildTool}</span></>}
            </p>
          )}
        </div>

        {repo.architectureStyle && (
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-2">
            <h4 className="text-xs font-bold text-gray-400">Architecture Pattern</h4>
            <p className="text-sm font-bold text-white">{repo.architectureStyle}</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Detected from folder structure, import chains, and module boundaries.
            </p>
          </div>
        )}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Orbit, label: "Code Universe", sub: "Visual graph", view: "universe", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          { icon: Shield, label: "Security Scan", sub: `${securityCount} findings`, view: "security", color: "text-danger", bg: "bg-danger/10 border-danger/20" },
          { icon: MessageSquare, label: "Ask AI", sub: "Chat about codebase", view: "chat", color: "text-accent", bg: "bg-accent/10 border-accent/20" },
          { icon: Sparkles, label: "AI Insights", sub: "Health report", view: "insights", color: "text-success", bg: "bg-success/10 border-success/20" },
        ].map(({ icon: Icon, label, sub, view, color, bg }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`glass-panel p-4 rounded-2xl border bg-white/[0.01] hover:bg-white/[0.03] transition-all text-left group active:scale-[0.98] ${bg}`}
          >
            <div className={`p-2 rounded-xl ${bg} w-fit mb-3 border`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-white/90 transition-colors">{label}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
