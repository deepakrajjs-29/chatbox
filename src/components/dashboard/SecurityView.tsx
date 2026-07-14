import { useEffect, useState } from "react";
import { Repository, SecurityVulnerability } from "../../types";
import { backendService } from "../../services/backend";
import { Lock, ShieldAlert, FileCode, Copy, Check } from "lucide-react";

interface SecurityViewProps {
  repo: Repository;
}

export function SecurityView({ repo }: SecurityViewProps) {
  const [issues, setIssues] = useState<SecurityVulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const data = await backendService.getSecurityIssues(repo.path);
        if (active) setIssues(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchIssues();
    return () => {
      active = false;
    };
  }, [repo]);

  const copySnippet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Security Scanner</h2>
          <p className="text-xs text-gray-400 mt-1">
            Detect credentials leaks, API tokens, SQL injections, and unsafe code executes locally.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-danger/10 border border-danger/25 text-[10px] text-danger font-semibold">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>{issues.length} High Risks Detected</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue, idx) => (
            <div 
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4 transition-all hover:bg-white/[0.02]"
            >
              {/* Top Row: Type and Severity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    issue.severity === "high" 
                      ? "bg-danger/10 text-danger border-danger/25" 
                      : "bg-warning/10 text-warning border-warning/25"
                  }`}>
                    <Lock className="h-4 w-4" />
                  </div>
                  
                  <div className="min-w-0">
                    <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider block">Security Violation</span>
                    <h4 className="text-sm font-bold text-white truncate">{issue.type}</h4>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border capitalize ${
                  issue.severity === "high" ? "bg-danger/10 text-danger border-danger/20" : "bg-warning/10 text-warning border-warning/20"
                }`}>
                  {issue.severity} severity
                </span>
              </div>

              {/* Middle Row: Description and file path */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400">
                  <FileCode className="h-3.5 w-3.5" />
                  <a 
                    href={`file:///${repo.path}/${issue.filePath}`} 
                    className="hover:text-primary transition-colors font-bold"
                  >
                    {issue.filePath}
                  </a>
                  <span>·</span>
                  <span className="text-gray-500 font-semibold">Line {issue.line}</span>
                </div>

                <p className="text-gray-300 leading-relaxed font-medium">
                  {issue.message}
                </p>
              </div>

              {/* Code Snippet */}
              {issue.snippet && (
                <div className="relative rounded-xl border border-white/5 bg-black/60 p-4 font-mono text-[11px] text-gray-400 overflow-x-auto shadow-inner group">
                  <button
                    onClick={() => copySnippet(issue.snippet, idx)}
                    className="absolute right-3 top-3 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Copy snippet"
                  >
                    {copiedId === idx ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <pre className="text-gray-300 font-medium">
                    <code>{issue.snippet}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
