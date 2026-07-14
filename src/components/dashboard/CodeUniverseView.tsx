import { useState, useEffect } from "react";
import { Repository, CodebaseUniverse, VisualizationNode } from "../../types";
import { backendService } from "../../services/backend";
import { 
  Orbit, 
  Layers, 
  Workflow, 
  Map, 
  HelpCircle, 
  BookOpen, 
  Flame, 
  FileCode,
  Sparkles
} from "lucide-react";

interface CodeUniverseViewProps {
  repo: Repository;
}

type TabType = "galaxy" | "flow" | "heatmap" | "timeline";

export function CodeUniverseView({ repo }: CodeUniverseViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("galaxy");
  const [universe, setUniverse] = useState<CodebaseUniverse | null>(null);
  const [selectedNode, setSelectedNode] = useState<VisualizationNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await backendService.generateCodeUniverse(repo.path);
        setUniverse(data);
        if (data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [repo]);

  if (loading || !universe) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-xs text-gray-500 space-y-3">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        <p>Generating visual nodes, mapping execution steps and directories heatmaps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fade-in flex flex-col h-[calc(100vh-6rem)]">
      
      {/* Header Info */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Orbit className="h-5 w-5 text-primary" />
            Codebase Universe
          </h2>
          <p className="text-xs text-gray-400 mt-1">Interactive visual map of file connections, code health metrics, and execution paths.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 shrink-0">
        <button
          onClick={() => setActiveTab("galaxy")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'galaxy' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Layers className="h-3.5 w-3.5" />
          Architecture Galaxy
        </button>
        <button
          onClick={() => setActiveTab("flow")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'flow' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Workflow className="h-3.5 w-3.5" />
          Execution Flow
        </button>
        <button
          onClick={() => setActiveTab("heatmap")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'heatmap' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Flame className="h-3.5 w-3.5" />
          Health Heatmap
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'timeline' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Map className="h-3.5 w-3.5" />
          Evolution Timeline
        </button>
      </div>

      {/* Content panel */}
      <div className="flex-1 min-h-0 flex gap-6">
        
        {/* Left Side: Dynamic Tab Views */}
        <div className="flex-1 glass-panel rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden flex flex-col min-w-0">
          
          {/* TAB 1: ARCHITECTURE GALAXY */}
          {activeTab === "galaxy" && (
            <div className="flex-1 p-6 relative flex items-center justify-center bg-black/40 overflow-hidden">
              <div className="absolute top-4 left-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Select a star to inspect codebase properties
              </div>
              
              {/* Galaxy nodes container map */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Simulated Galaxy Center */}
                <div className="absolute h-8 w-8 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
                
                {universe.nodes.map((node, idx) => {
                  // Coordinate spreads
                  const angle = (idx * 2 * Math.PI) / universe.nodes.length;
                  const radius = 140; // distance from center
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  // Color codes
                  const healthColor = node.health >= 90 
                    ? "bg-success border-success/30 shadow-success/20" 
                    : node.health >= 70 
                      ? "bg-primary border-primary/30 shadow-primary/20" 
                      : "bg-danger border-danger/30 shadow-danger/20";
                      
                  const isSelected = selectedNode?.id === node.id;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className={`absolute p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all active:scale-[0.96] ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-black/50 scale-[1.08] bg-white/[0.04]' : 'bg-black/50 hover:bg-white/[0.02]'}`}
                    >
                      <div className={`h-3 w-3 rounded-full shadow-lg ${healthColor}`}></div>
                      <span className="font-mono text-[9px] font-bold text-gray-300 truncate max-w-[90px]" title={node.name}>
                        {node.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EXECUTION FLOW */}
          {activeTab === "flow" && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Checkout Flow Execution Path
              </div>
              <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6">
                {universe.execution_flows.map((step) => (
                  <div key={step.step_number} className="relative">
                    {/* Circle icon */}
                    <div className="absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full bg-primary flex items-center justify-center font-bold text-[9px] text-white">
                      {step.step_number}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-white font-bold">{step.name}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-400 font-semibold">{step.file_path}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HEALTH HEATMAP */}
          {activeTab === "heatmap" && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Codebase Directory Health Heatmap
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {universe.health_heatmap.map((folder) => {
                  const color = folder.health_color === 'green' 
                    ? 'border-success/20 bg-success/5 text-success' 
                    : folder.health_color === 'yellow' 
                      ? 'border-warning/20 bg-warning/5 text-warning' 
                      : 'border-danger/20 bg-danger/5 text-danger';
                      
                  return (
                    <div 
                      key={folder.path}
                      className={`p-4 rounded-xl border flex flex-col justify-between h-28 hover:bg-white/[0.01] transition-all ${color}`}
                    >
                      <div className="font-mono text-xs font-bold truncate">
                        {folder.path}/
                      </div>
                      
                      <div className="flex items-end justify-between font-sans text-[10px] text-gray-400">
                        <div className="space-y-0.5">
                          <div>Size: <span className="text-white font-bold">{Math.round(folder.size / 1024)} KB</span></div>
                          <div>Complexity: <span className="text-white font-bold">{folder.complexity}</span></div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-bold">
                          {folder.bugs_count} bugs scanned
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: EVOLUTION TIMELINE */}
          {activeTab === "timeline" && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Repository Milestones Timeline
              </div>
              <div className="relative border-l border-white/5 ml-3 pl-6 space-y-8">
                <div className="relative">
                  <div className="absolute -left-[30px] top-0 h-4.5 w-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary"><BookOpen className="h-2.5 w-2.5" /></div>
                  <div className="text-[10px] font-mono text-gray-500">2026-07-14</div>
                  <h4 className="text-xs font-bold text-white mt-1">Indexing Pipeline Rollout</h4>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-md">Added client embeddings generator algorithms and dynamic hybrid search query matching.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[30px] top-0 h-4.5 w-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary"><BookOpen className="h-2.5 w-2.5" /></div>
                  <div className="text-[10px] font-mono text-gray-500">2026-04-12</div>
                  <h4 className="text-xs font-bold text-white mt-1">Checkout & billing routines introduced</h4>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-md">Introduced CheckoutForm layout panels, cart lists context bindings, and pricing execution methods.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[30px] top-0 h-4.5 w-4.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary"><BookOpen className="h-2.5 w-2.5" /></div>
                  <div className="text-[10px] font-mono text-gray-500">2026-02-15</div>
                  <h4 className="text-xs font-bold text-white mt-1">Application Scaffolding setup</h4>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-md">Structured app layouts, registered sidebar navigational links, and styled dashboard viewport panels.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: AI Explanations Panel */}
        <div className="w-80 glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] shrink-0 overflow-y-auto flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                <FileCode className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="truncate">{selectedNode.name}</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Properties</div>
                <div className="p-3 rounded-xl border border-white/5 bg-black/40 text-[10px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Type:</span>
                    <span className="text-gray-300 font-bold capitalize">{selectedNode.node_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Language:</span>
                    <span className="text-gray-300 font-bold">{selectedNode.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Owner:</span>
                    <span className="text-gray-300 font-bold">{selectedNode.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Risk Factor:</span>
                    <span className={`font-extrabold uppercase ${selectedNode.risk === 'HIGH' ? 'text-danger' : selectedNode.risk === 'MEDIUM' ? 'text-primary' : 'text-success'}`}>{selectedNode.risk}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI Structural Analysis
                </div>
                <p className="text-[10px] text-gray-400 leading-normal font-medium bg-white/[0.01] p-3 rounded-lg border border-white/5">
                  {selectedNode.id === 'checkout_form' 
                    ? "CheckoutForm component exhibits elevated complexity. It aggregates billing math, state context tracking, and POST queries. We recommend migrating API routines to custom services hooks."
                    : selectedNode.id === 'api_service' 
                      ? "api.ts exports network wrappers. Note that a high severity api secret credentials leak was identified on line 2."
                      : "General helper services mapping declarations. Code health is green, dependency coupling is low."}
                </p>
              </div>

              {selectedNode.dependencies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Coupling Nodes</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.dependencies.map(dep => (
                      <span key={dep} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px] text-gray-400">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-xs text-gray-500">
              <HelpCircle className="h-8 w-8 text-gray-700 mx-auto mb-2 animate-pulse" />
              <span>Select a galaxy node to view explanation.</span>
            </div>
          )}

          <div className="text-[9px] text-gray-600 font-semibold tracking-wider uppercase pt-4 border-t border-white/5 mt-4 text-center shrink-0">
            Offline Visualization Index
          </div>
        </div>

      </div>

    </div>
  );
}
