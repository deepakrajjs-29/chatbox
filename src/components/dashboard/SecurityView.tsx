import { useEffect, useState } from "react";
import { Repository } from "../../types";
import { backendService } from "../../services/backend";
import {
  Lock,
  ShieldAlert,
  FileCode,
  Copy,
  Check,
  AlertOctagon,
  AlertTriangle,
  Info,
  ChevronDown,
  Shield,
  ArrowRight,
} from "lucide-react";

interface SecurityFinding {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  file_path: string;
  line_number: number;
  recommendation: string;
  snippet?: string;
}

interface SecurityViewProps {
  repo: Repository;
  onViewChange?: (view: string) => void;
}

type SeverityFilter = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

const SEVERITY_CONFIG = {
  CRITICAL: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    icon: AlertOctagon,
    label: "Critical",
  },
  HIGH: {
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/25",
    icon: ShieldAlert,
    label: "High",
  },
  MEDIUM: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/25",
    icon: AlertTriangle,
    label: "Medium",
  },
  LOW: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    icon: Info,
    label: "Low",
  },
  INFO: {
    color: "text-gray-400",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: Info,
    label: "Info",
  },
};

function maskSecret(text: string): string {
  // Mask API keys, tokens, passwords that look like credentials
  return text
    .replace(/(sk_live_|sk_test_|api_key=|token=|password=|secret=|Bearer\s+)[A-Za-z0-9_\-./+]{8,}/gi, (match) => {
      return `${match.slice(0, 8)}${"*".repeat(12)}`;
    })
    .replace(/[A-Za-z0-9]{20,}/g, (match) => {
      if (match.length > 20) return `${match.slice(0, 6)}${"*".repeat(8)}...`;
      return match;
    });
}

export function SecurityView({ repo, onViewChange }: SecurityViewProps) {
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>("ALL");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const insights = await backendService.getRepositoryInsights(repo.path);
        // Map SecurityScanFinding to our unified type, adding CRITICAL tier
        const mapped: SecurityFinding[] = insights.security_findings.map((f) => ({
          severity: f.severity === "HIGH" && f.title.toLowerCase().includes("credential")
            ? "CRITICAL"
            : (f.severity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"),
          title: f.title,
          file_path: f.file_path,
          line_number: f.line_number,
          recommendation: f.recommendation,
        }));

        // Also get legacy security issues
        try {
          const legacyIssues = await backendService.getSecurityIssues(repo.path);
          const legacyMapped: SecurityFinding[] = legacyIssues.map((issue) => ({
            severity: issue.severity === "high" ? "HIGH" : "MEDIUM",
            title: issue.type,
            file_path: issue.filePath,
            line_number: issue.line,
            recommendation: issue.message,
            snippet: issue.snippet,
          }));
          // Deduplicate by title
          const existingTitles = new Set(mapped.map((m) => m.title));
          legacyMapped.forEach((lm) => {
            if (!existingTitles.has(lm.title)) mapped.push(lm);
          });
        } catch {
          // Ignore if legacy endpoint fails
        }

        if (active) setFindings(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [repo]);

  const copySnippet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleExpanded = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const counts = {
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL").length,
    HIGH: findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM").length,
    LOW: findings.filter((f) => f.severity === "LOW").length,
    INFO: findings.filter((f) => f.severity === "INFO").length,
  };

  const filteredFindings =
    filter === "ALL" ? findings : findings.filter((f) => f.severity === filter);

  const totalCritical = counts.CRITICAL + counts.HIGH;

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Lock className="h-5 w-5 text-danger" />
            Security Intelligence
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Static analysis for credentials, dangerous patterns, and security vulnerabilities — 100% local.
          </p>
        </div>

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-semibold">
          <Shield className="h-3 w-3" />
          <span>Local SAST Scan</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-3">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Running local security scan...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Dashboard */}
          <div className="grid grid-cols-5 gap-3 shrink-0">
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as const).map((sev) => {
              const cfg = SEVERITY_CONFIG[sev];
              const Icon = cfg.icon;
              const count = counts[sev];
              return (
                <button
                  key={sev}
                  onClick={() => setFilter(filter === sev ? "ALL" : sev)}
                  className={`glass-panel p-4 rounded-2xl border transition-all text-left active:scale-[0.97] ${
                    filter === sev
                      ? `${cfg.bg} ${cfg.border} ring-1 ring-current ring-offset-2 ring-offset-black/50`
                      : "border-white/5 bg-white/[0.01] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className={`text-2xl font-extrabold ${count > 0 ? cfg.color : "text-gray-600"}`}>{count}</div>
                </button>
              );
            })}
          </div>

          {/* Clean / Alert Banner */}
          {findings.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3 py-16">
                <div className="h-16 w-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-sm font-bold text-white">No Security Issues Found</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  The local SAST scanner found no hardcoded credentials, dangerous patterns, or security vulnerabilities.
                </p>
              </div>
            </div>
          ) : (
            <>
              {totalCritical > 0 && (
                <div className="p-3 rounded-xl bg-danger/5 border border-danger/20 flex items-center gap-3 text-xs shrink-0">
                  <AlertOctagon className="h-4 w-4 text-danger shrink-0" />
                  <span className="text-gray-300">
                    <span className="font-bold text-danger">{totalCritical} critical/high severity finding{totalCritical > 1 ? "s" : ""}</span> require immediate attention.
                    Secrets found in code should be rotated immediately.
                  </span>
                  {onViewChange && (
                    <button
                      onClick={() => onViewChange("chat")}
                      className="ml-auto flex items-center gap-1 text-primary hover:text-primary/80 font-semibold whitespace-nowrap"
                    >
                      Ask AI <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === "ALL" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                  }`}
                >
                  All ({findings.length})
                </button>
                {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).filter((s) => counts[s] > 0).map((sev) => {
                  const cfg = SEVERITY_CONFIG[sev];
                  return (
                    <button
                      key={sev}
                      onClick={() => setFilter(filter === sev ? "ALL" : sev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === sev ? `${cfg.bg} ${cfg.color}` : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {cfg.label} ({counts[sev]})
                    </button>
                  );
                })}
              </div>

              {/* Findings List */}
              <div className="space-y-3 overflow-y-auto flex-1">
                {filteredFindings.map((finding, idx) => {
                  const cfg = SEVERITY_CONFIG[finding.severity];
                  const Icon = cfg.icon;
                  const isExpanded = expanded.has(idx);

                  return (
                    <div
                      key={idx}
                      className={`glass-panel rounded-2xl border transition-all ${cfg.border} bg-white/[0.01] overflow-hidden`}
                    >
                      <button
                        className="w-full p-5 text-left flex items-start gap-4"
                        onClick={() => toggleExpanded(idx)}
                      >
                        {/* Severity Icon */}
                        <div className={`p-2 rounded-xl shrink-0 ${cfg.bg} border ${cfg.border}`}>
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-white">{finding.title}</h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wide uppercase ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                {finding.severity}
                              </span>
                              <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-400">
                            <FileCode className="h-3 w-3 text-primary/60 shrink-0" />
                            <a
                              href={`file:///${repo.path}/${finding.file_path}`}
                              className="hover:text-primary transition-colors font-semibold truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {finding.file_path}
                            </a>
                            {finding.line_number > 0 && (
                              <>
                                <span className="text-gray-600">·</span>
                                <span className="text-gray-500">Line {finding.line_number}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
                          <div className="text-[10px] text-gray-300 leading-relaxed">
                            <span className="font-bold text-primary">Recommendation: </span>
                            {finding.recommendation}
                          </div>

                          {finding.snippet && (
                            <div className="relative rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-[10px] text-gray-400 overflow-x-auto group">
                              <button
                                onClick={() => copySnippet(maskSecret(finding.snippet!), idx)}
                                className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                              >
                                {copiedId === idx ? (
                                  <Check className="h-3.5 w-3.5 text-success" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <pre className="text-gray-300">{maskSecret(finding.snippet)}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
