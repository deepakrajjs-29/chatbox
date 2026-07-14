import { useEffect, useState } from "react";
import { Repository, BugHotspot } from "../../types";
import { backendService } from "../../services/backend";
import { Flame, FileCode, ArrowUpRight } from "lucide-react";

interface HotspotsViewProps {
  repo: Repository;
}

export function HotspotsView({ repo }: HotspotsViewProps) {
  const [hotspots, setHotspots] = useState<BugHotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchHotspots = async () => {
      setLoading(true);
      try {
        const data = await backendService.getBugHotspots(repo.path);
        if (active) setHotspots(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchHotspots();
    return () => {
      active = false;
    };
  }, [repo]);

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Bug Hotspots</h2>
        <p className="text-xs text-gray-400 mt-1">
          Predict high-risk modules combining file complexity metrics, nesting levels, and file lengths.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {hotspots.map((hotspot) => (
            <div 
              key={hotspot.filePath}
              className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] grid md:grid-cols-4 gap-6 items-start transition-all hover:bg-white/[0.02]"
            >
              {/* Score / File details */}
              <div className="md:col-span-1 flex items-start gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                  hotspot.score >= 80 ? "bg-danger/10 text-danger border-danger/25 animate-pulse" :
                  hotspot.score >= 60 ? "bg-warning/10 text-warning border-warning/25" :
                  "bg-success/10 text-success border-success/25"
                }`}>
                  <Flame className="h-5 w-5" />
                </div>
                
                <div className="text-xs min-w-0">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Risk Score</span>
                  <span className="text-2xl font-black text-white leading-none mt-1 block">
                    {hotspot.score}<span className="text-xs font-semibold text-gray-500">/100</span>
                  </span>
                </div>
              </div>

              {/* Code stats info */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileCode className="h-4 w-4 text-gray-500 shrink-0" />
                  <span className="font-mono text-sm font-bold text-white truncate" title={hotspot.filePath}>
                    {hotspot.filePath}
                  </span>
                </div>

                <div className="flex gap-4 text-[10px] text-gray-400 font-medium">
                  <span>Lines of Code: <span className="font-bold text-white font-mono">{hotspot.linesOfCode}</span></span>
                  <span>Complexity: <span className="font-bold text-white font-mono">{hotspot.complexity}</span></span>
                </div>

                {/* Justifications */}
                <div className="space-y-1 mt-2.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Risk Factors</span>
                  {hotspot.reasons.map((reason, i) => (
                    <div key={i} className="flex gap-1.5 items-start text-xs text-gray-300 font-medium leading-relaxed">
                      <span className="text-danger/60 shrink-0">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions column */}
              <div className="md:col-span-1 flex flex-col justify-between h-full text-right self-stretch">
                <div></div>
                <a
                  href={`file:///${repo.path}/${hotspot.filePath}`}
                  className="w-fit ml-auto flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-white transition-colors"
                >
                  View source code
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
