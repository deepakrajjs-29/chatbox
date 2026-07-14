import { useState, useEffect } from "react";
import { Repository, RepositoryInsights } from "../../types";
import { backendService } from "../../services/backend";
import { 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  Wrench, 
  BadgeAlert, 
  Gauge
} from "lucide-react";

interface InsightsViewProps {
  repo: Repository;
}

export function InsightsView({ repo }: InsightsViewProps) {
  const [insights, setInsights] = useState<RepositoryInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const report = await backendService.getRepositoryInsights(repo.path);
        setInsights(report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [repo]);

  if (loading || !insights) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-xs text-gray-500 space-y-3">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p>Running autonomous codebase insights scan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Autonomous Insights
          </h2>
          <p className="text-xs text-gray-400 mt-1">Autonomous analysis engine evaluating code smells, complexities, and security vulnerabilities.</p>
        </div>
      </div>

      {/* Health Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.health_scores.map((item) => (
          <div 
            key={item.category}
            className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-bold">{item.category}</span>
              <span className={`text-base font-extrabold ${item.score >= 90 ? 'text-success' : item.score >= 70 ? 'text-primary' : 'text-danger'}`}>
                {item.score}%
              </span>
            </div>
            
            {/* Visual Progress Line */}
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${item.score >= 90 ? 'from-success to-success/70' : item.score >= 70 ? 'from-primary to-accent' : 'from-danger to-danger/70'}`}
                style={{ width: `${item.score}%` }}
              ></div>
            </div>

            <p className="text-[10px] text-gray-500 leading-normal font-medium">{item.reason}</p>
          </div>
        ))}
      </div>

      {/* Findings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Security Findings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-danger" />
            Critical Vulnerabilities
          </h3>

          <div className="space-y-3">
            {insights.security_findings.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-white/5 rounded-2xl bg-white/[0.01]">
                No security vulnerabilities detected.
              </div>
            ) : (
              insights.security_findings.map((find) => (
                <div 
                  key={find.title}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-start gap-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${find.severity === 'HIGH' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                    <BadgeAlert className="h-4 w-4" />
                  </div>
                  
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{find.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase ${find.severity === 'HIGH' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
                        {find.severity}
                      </span>
                    </div>
                    
                    <div className="font-mono text-[9px] text-gray-500">
                      File: <span className="text-gray-300 font-semibold">{find.file_path}</span> on Line {find.line_number}
                    </div>

                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      <span className="text-primary font-bold">Fix: </span>
                      {find.recommendation}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Complexity Warnings */}
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pt-4">
            <Gauge className="h-4.5 w-4.5 text-accent" />
            Complexity Analysis
          </h3>
          <div className="space-y-3">
            {insights.complexity_warnings.map((warn, i) => (
              <div 
                key={i}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2 hover:bg-white/[0.02] transition-colors"
              >
                <div className="font-mono text-[10px] text-gray-300 font-bold truncate">
                  {warn.file_path}
                </div>
                <div className="text-[10px] text-gray-400 leading-normal">
                  <span className="text-accent font-bold">Issue: </span>{warn.issue}
                </div>
                <div className="text-[10px] text-gray-500 leading-normal italic">
                  Impact: {warn.impact}
                </div>
                <div className="text-[10px] text-gray-400 leading-normal">
                  <span className="text-success font-bold">Recommendation: </span>{warn.recommendation}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Code Smells & Refactoring Timelines */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Wrench className="h-4.5 w-4.5 text-success" />
            Code Smells & Roadmaps
          </h3>

          <div className="space-y-3">
            {insights.code_smells.map((smell, i) => (
              <div 
                key={i}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{smell.title}</span>
                  <span className="font-mono text-[9px] text-gray-500">Lines {smell.lines}</span>
                </div>
                <div className="font-mono text-[9px] text-gray-400">
                  File: <span className="text-gray-300 font-bold">{smell.file_path}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                  {smell.description}
                </p>
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                  <span className="text-success font-bold">Plan: </span>{smell.recommendation}
                </p>
              </div>
            ))}
          </div>

          {/* Action Items List */}
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 pt-4">
            <Activity className="h-4.5 w-4.5 text-primary" />
            AI Recommended Actions
          </h3>
          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3">
            {insights.refactoring_roadmap.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-[10px] leading-relaxed text-gray-400">
                <div className="h-4.5 w-4.5 rounded-full bg-white/5 flex items-center justify-center font-bold text-[9px] text-primary shrink-0">
                  {idx + 1}
                </div>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
