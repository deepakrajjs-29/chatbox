import { useState, useEffect } from "react";
import { Repository, GitCommit, OwnerContribution, KnowledgeRisk, ImpactResult } from "../../types";
import { backendService } from "../../services/backend";
import { 
  GitBranch, 
  History, 
  GitCommit as CommitIcon, 
  AlertOctagon, 
  Network, 
  Users, 
  Search,
  ArrowRight
} from "lucide-react";

interface GitViewProps {
  repo: Repository;
}

export function GitView({ repo }: GitViewProps) {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [owners, setOwners] = useState<OwnerContribution[]>([]);
  const [risks, setRisks] = useState<KnowledgeRisk[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Change impact tracker
  const [selectedFile, setSelectedFile] = useState("src/components/CheckoutForm.tsx");
  const [impact, setImpact] = useState<ImpactResult | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const log = await backendService.analyzeGitHistory(repo.path);
        const contribs = await backendService.getCodeOwnership(repo.path);
        const knowledgeRisks = await backendService.calculateKnowledgeRisk(repo.path);
        
        setCommits(log);
        setOwners(contribs);
        setRisks(knowledgeRisks);
        
        const imp = await backendService.analyzeChangeImpact(repo.path, selectedFile);
        setImpact(imp);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [repo, selectedFile]);

  // Handle semantic commits search
  const filteredCommits = commits.filter(c => 
    c.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !impact) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-xs text-gray-500 space-y-3">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p>Parsing git log timeline, branches and ownership configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Git Evolution & Change Impact
          </h2>
          <p className="text-xs text-gray-400 mt-1">Version control metrics, code history analytics, and file modification risk predictors.</p>
        </div>
      </div>

      {/* Top Section: Impact Analyzer & Knowledge Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Change Impact Analysis (2 cols wide) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="h-4.5 w-4.5 text-primary" />
            Change Impact Analyzer
          </h3>
          
          <div className="flex items-center gap-3">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Analyze Modifying:</label>
            <select 
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="src/components/CheckoutForm.tsx">src/components/CheckoutForm.tsx</option>
              <option value="src/services/api.ts">src/services/api.ts</option>
              <option value="src/services/indexer.ts">src/services/indexer.ts</option>
            </select>
          </div>

          {/* Interactive Flow visualization */}
          <div className="p-4 rounded-xl border border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono font-bold text-white shrink-0">
              {selectedFile.split('/').pop()}
            </div>
            
            <ArrowRight className="h-4 w-4 text-gray-600 rotate-90 md:rotate-0" />
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              {impact.affected_components.map((comp) => (
                <div key={comp} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                  {comp}
                </div>
              ))}
            </div>

            <ArrowRight className="h-4 w-4 text-gray-600 rotate-90 md:rotate-0" />

            <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs shrink-0 ${impact.risk_level === 'HIGH' ? 'bg-danger/10 text-danger border-danger/25' : 'bg-success/10 text-success border-success/25'}`}>
              {impact.risk_level} RISK
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-medium leading-relaxed leading-normal bg-white/[0.01] p-3 rounded-lg border border-white/5">
            <span className="text-primary font-bold">RAG Safety Recommendations: </span>
            {impact.recommendation}
          </div>
        </div>

        {/* Ownership Risk Panel (1 col wide) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertOctagon className="h-4.5 w-4.5 text-danger" />
            Knowledge Bus Factor Risk
          </h3>
          
          <div className="space-y-3">
            {risks.map((risk) => (
              <div 
                key={risk.module_name}
                className="p-4 rounded-xl border border-danger/20 bg-danger/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{risk.module_name}</span>
                  <span className="px-2 py-0.5 rounded bg-danger/15 text-[8px] font-extrabold text-danger uppercase tracking-wide">
                    {risk.risk_level} RISK
                  </span>
                </div>
                <div className="text-[10px] text-gray-400">
                  Maintained solely by: <span className="text-white font-bold">{risk.main_maintainer}</span>
                </div>
                <p className="text-[9px] text-gray-500 leading-normal font-medium">
                  {risk.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Git Log Timeline & Contributor Ownership Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Git Log Timeline (2 cols wide) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4 flex flex-col max-h-[55vh]">
          <div className="flex items-center justify-between gap-4 flex-wrap shrink-0">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-primary" />
              Repository Evolution Timeline
            </h3>

            {/* Commits Query Search */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1 text-xs max-w-xs w-full">
              <Search className="h-3.5 w-3.5 text-gray-500" />
              <input 
                type="text"
                placeholder="Search commit logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent focus:outline-none placeholder-gray-500 text-white w-full text-[10px]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {filteredCommits.map((commit, idx) => (
              <div key={commit.hash} className="flex gap-4 relative">
                {/* Visual Timeline Path */}
                {idx !== filteredCommits.length - 1 && (
                  <div className="absolute left-3 top-6 bottom-0 w-[1px] bg-white/5"></div>
                )}
                
                <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                  <CommitIcon className="h-3.5 w-3.5" />
                </div>

                <div className="space-y-1 pb-2">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500">
                    <span className="text-primary font-bold">{commit.hash}</span>
                    <span>·</span>
                    <span className="text-gray-400 font-bold">{commit.author}</span>
                    <span>·</span>
                    <span>{commit.date}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-semibold">{commit.message}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {commit.changed_files.map(f => (
                      <span key={f} className="px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/5 text-[8px] font-mono text-gray-500">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ownership map & Contributions % */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-success" />
            Developer Ownership Map
          </h3>
          
          <div className="space-y-4">
            {owners.map((owner) => (
              <div key={owner.developer} className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="font-bold text-white">
                    {owner.developer}
                    <span className="block text-[9px] text-gray-500 font-medium font-sans mt-0.5">
                      Module: {owner.module_name}
                    </span>
                  </div>
                  <span className="text-success font-bold font-mono">{owner.contribution_percentage}%</span>
                </div>
                
                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-success/90 to-success/60"
                    style={{ width: `${owner.contribution_percentage}%` }}
                  ></div>
                </div>
                <div className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider">
                  Files index: {owner.files_count} modified files
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
