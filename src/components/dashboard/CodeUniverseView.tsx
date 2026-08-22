import { useState, useEffect, useCallback } from "react";
import { Repository, CodebaseUniverse, VisualizationNode } from "../../types";
import { backendService } from "../../services/backend";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Orbit,
  Layers,
  Workflow,
  Flame,
  Map,
  FileCode,
  Sparkles,
  AlertTriangle,
  Shield,
  User,
  BookOpen,
  Filter,
  Search,
  X,
  ChevronRight,
} from "lucide-react";

interface CodeUniverseViewProps {
  repo: Repository;
}

type TabType = "galaxy" | "flow" | "heatmap" | "timeline";
type FilterType = "all" | "high-risk" | "complex" | "external";

// Language color map
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  default: "#6b7280",
};

// Node type shapes
function getNodeColor(node: VisualizationNode): string {
  if (node.risk === "HIGH") return "#EF4444";
  if (node.risk === "MEDIUM") return "#F59E0B";
  if (node.health >= 90) return "#22C55E";
  if (node.health >= 70) return "#4F8CFF";
  return "#6b7280";
}

function buildReactFlowGraph(
  universe: CodebaseUniverse,
  filter: FilterType,
  search: string
): { nodes: Node[]; edges: Edge[] } {
  const filteredNodes = universe.nodes.filter((n) => {
    if (search && !n.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "high-risk" && n.risk !== "HIGH") return false;
    if (filter === "complex" && n.complexity < 60) return false;
    if (filter === "external" && n.node_type !== "external") return false;
    return true;
  });

  const nodeIds = new Set(filteredNodes.map((n) => n.id));
  const count = filteredNodes.length;

  // Compute positions in a circle layout
  const rfNodes: Node[] = filteredNodes.map((node, idx) => {
    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
    const radius = Math.max(200, count * 45);
    const x = Math.cos(angle) * radius + radius;
    const y = Math.sin(angle) * radius + radius;
    const color = getNodeColor(node);
    const langColor = LANG_COLORS[node.language] || LANG_COLORS.default;

    return {
      id: node.id,
      position: { x, y },
      data: {
        label: (
          <div className="flex flex-col items-center gap-0.5 p-1">
            <div
              className="h-2.5 w-2.5 rounded-full border-2 border-white/30"
              style={{ backgroundColor: color }}
            />
            <span
              className="text-[9px] font-bold text-white leading-tight max-w-[70px] text-center truncate"
              title={node.name}
            >
              {node.name.split("/").pop()}
            </span>
            <span
              className="text-[8px] font-semibold"
              style={{ color: langColor }}
            >
              {node.language}
            </span>
          </div>
        ),
      },
      style: {
        background: `rgba(20,20,20,0.9)`,
        border: `1.5px solid ${color}40`,
        borderRadius: "12px",
        padding: "4px",
        width: 90,
        boxShadow: `0 0 12px ${color}25`,
        cursor: "pointer",
      },
    };
  });

  const rfEdges: Edge[] = universe.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e, idx) => ({
      id: `edge-${idx}`,
      source: e.source,
      target: e.target,
      label: e.relationship,
      labelStyle: { fontSize: 8, fill: "#6b7280" },
      style: {
        stroke: e.risk === "HIGH" ? "#EF444460" : e.risk === "MEDIUM" ? "#F59E0B50" : "rgba(255,255,255,0.12)",
        strokeWidth: Math.max(1, e.weight / 3),
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.risk === "HIGH" ? "#EF444460" : "rgba(255,255,255,0.15)",
        width: 8,
        height: 8,
      },
      animated: e.risk === "HIGH",
    }));

  return { nodes: rfNodes, edges: rfEdges };
}

export function CodeUniverseView({ repo }: CodeUniverseViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("galaxy");
  const [universe, setUniverse] = useState<CodebaseUniverse | null>(null);
  const [selectedNode, setSelectedNode] = useState<VisualizationNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await backendService.generateCodeUniverse(repo.path);
        setUniverse(data);
        if (data.nodes.length > 0) setSelectedNode(data.nodes[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [repo]);

  // Rebuild graph on filter/search change
  useEffect(() => {
    if (!universe) return;
    const { nodes: rfNodes, edges: rfEdges } = buildReactFlowGraph(universe, filter, search);
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [universe, filter, search, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: any, rfNode: Node) => {
      if (!universe) return;
      const found = universe.nodes.find((n) => n.id === rfNode.id);
      if (found) setSelectedNode(found);
    },
    [universe]
  );

  const healthColorClass = (h: number) =>
    h >= 90 ? "text-success" : h >= 70 ? "text-primary" : h >= 50 ? "text-warning" : "text-danger";

  if (loading || !universe) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-xs text-gray-500 space-y-3">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p>Building code topology map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in flex flex-col" style={{ height: "calc(100vh - 6rem)" }}>

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Orbit className="h-5 w-5 text-primary" />
            Code Universe
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {universe.nodes.length} modules · {universe.edges.length} connections · Interactive topology map
          </p>
        </div>

        {/* Filter bar */}
        {activeTab === "galaxy" && (
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <Search className="h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Filter nodes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none placeholder-gray-600 w-28"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="h-3 w-3 text-gray-500 hover:text-white" />
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              <Filter className="h-3.5 w-3.5 text-gray-500 mx-1" />
              {(["all", "high-risk", "complex", "external"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                    filter === f ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {f.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 pb-2 shrink-0">
        {[
          { id: "galaxy" as TabType, label: "Architecture Galaxy", icon: Layers },
          { id: "flow" as TabType, label: "Execution Flow", icon: Workflow },
          { id: "heatmap" as TabType, label: "Health Heatmap", icon: Flame },
          { id: "timeline" as TabType, label: "Evolution Timeline", icon: Map },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-4 min-h-0">

        {/* Main Panel */}
        <div className="flex-1 glass-panel rounded-2xl border border-white/5 bg-black/40 overflow-hidden min-h-0">

          {/* GALAXY TAB — Real React Flow */}
          {activeTab === "galaxy" && (
            <div className="w-full h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                proOptions={{ hideAttribution: true }}
                colorMode="dark"
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.04)" />
                <Controls
                  showInteractive={false}
                  className="!bg-[rgba(15,15,15,0.9)] !border-white/10 !rounded-xl !shadow-none"
                />
                <MiniMap
                  nodeColor={(n) => {
                    const orig = universe.nodes.find((un) => un.id === n.id);
                    return orig ? getNodeColor(orig) : "#6b7280";
                  }}
                  maskColor="rgba(10,10,10,0.8)"
                  style={{
                    background: "rgba(10,10,10,0.9)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                  }}
                />
              </ReactFlow>
            </div>
          )}

          {/* EXECUTION FLOW TAB */}
          {activeTab === "flow" && (
            <div className="p-6 overflow-y-auto h-full space-y-2">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-4">
                Primary Execution Path — {repo.name}
              </div>
              <div className="relative border-l-2 border-primary/20 ml-4 pl-6 space-y-6">
                {universe.execution_flows.map((step) => (
                  <div key={step.step_number} className="relative group">
                    <div className="absolute -left-[33px] top-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center font-bold text-[10px] text-white shadow-lg shadow-primary/30">
                      {step.step_number}
                    </div>
                    <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-primary/20 transition-all space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{step.name}</span>
                        <ChevronRight className="h-3 w-3 text-gray-600" />
                        <code className="text-[10px] font-mono text-primary/80">{step.file_path}</code>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HEATMAP TAB */}
          {activeTab === "heatmap" && (
            <div className="p-6 overflow-y-auto h-full space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Directory Health Heatmap
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  {[["green", "Healthy", "text-success"], ["yellow", "Warning", "text-warning"], ["red", "Critical", "text-danger"]].map(([, label, cls]) => (
                    <span key={label} className={`flex items-center gap-1 ${cls} font-semibold`}>
                      <span className="h-2 w-2 rounded-sm bg-current opacity-80" /> {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {universe.health_heatmap.map((folder) => {
                  const isRed = folder.health_color === "red";
                  const isYellow = folder.health_color === "yellow";
                  return (
                    <div
                      key={folder.path}
                      className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                        isRed
                          ? "border-danger/25 bg-danger/5"
                          : isYellow
                          ? "border-warning/25 bg-warning/5"
                          : "border-success/20 bg-success/5"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <code className={`text-xs font-bold font-mono ${isRed ? "text-danger" : isYellow ? "text-warning" : "text-success"}`}>
                            /{folder.path}
                          </code>
                        </div>
                        {folder.bugs_count > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/15 border border-danger/20 text-[9px] font-bold text-danger">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {folder.bugs_count} issues
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <div className="text-gray-500 mb-1">Size</div>
                          <div className="font-bold text-white">{Math.round(folder.size / 1024)} KB</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Complexity</div>
                          <div className={`font-bold ${folder.complexity > 70 ? "text-danger" : folder.complexity > 45 ? "text-warning" : "text-success"}`}>
                            {folder.complexity}/100
                          </div>
                        </div>
                      </div>
                      {/* Complexity bar */}
                      <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isRed ? "bg-danger" : isYellow ? "bg-warning" : "bg-success"}`}
                          style={{ width: `${folder.complexity}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === "timeline" && (
            <div className="p-6 overflow-y-auto h-full">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-6">
                Repository Milestone Timeline
              </div>
              <div className="relative border-l-2 border-white/10 ml-4 pl-6 space-y-8">
                {[
                  { date: "2026-07-14", title: "Semantic Indexing Pipeline", desc: "Implemented offline embedding pipeline with 384-dim hashing projection and hybrid cosine+keyword search engine." },
                  { date: "2026-07-14", title: "Local AI Architect", desc: "Added offline RAG with typewriter token streaming and intent classification for bug-detective and domain queries." },
                  { date: "2026-04-12", title: "Checkout & Billing Routines", desc: "Introduced CheckoutForm, cart context bindings, and pricing evaluation methods. Note: eval() usage flagged by SAST scanner." },
                  { date: "2026-02-15", title: "Application Scaffold", desc: "Initial project structure: sidebar navigation, dashboard panels, and core design system established." },
                ].map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <BookOpen className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <div className="text-[10px] font-mono text-gray-600 mb-1">{event.date}</div>
                    <h4 className="text-xs font-bold text-white mb-1">{event.title}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed max-w-lg">{event.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Node Inspector Panel */}
        {activeTab === "galaxy" && (
          <div className="w-72 glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] shrink-0 overflow-y-auto space-y-4">
            {selectedNode ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileCode className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-white truncate">{selectedNode.name}</span>
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedNode.risk === "HIGH" ? "text-danger" : selectedNode.risk === "MEDIUM" ? "text-warning" : "text-success"
                  }`}>
                    {selectedNode.risk} RISK
                  </div>
                </div>

                {/* Score bars */}
                <div className="space-y-3">
                  {[
                    { label: "Health", value: selectedNode.health, color: healthColorClass(selectedNode.health) },
                    { label: "Complexity", value: selectedNode.complexity, color: selectedNode.complexity > 70 ? "text-danger" : "text-primary" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-gray-500">{label}</span>
                        <span className={`font-bold tabular-nums ${color}`}>{value}/100</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${label === "Health" ? "bg-success" : "bg-primary"}`}
                          style={{ width: `${value}%`, opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="text-[10px] space-y-2 border-t border-white/5 pt-3">
                  {[
                    { icon: FileCode, label: "Type", value: selectedNode.node_type },
                    { icon: Sparkles, label: "Language", value: selectedNode.language },
                    { icon: User, label: "Owner", value: selectedNode.owner },
                    { icon: Shield, label: "Risk", value: selectedNode.risk },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Icon className="h-3 w-3" />
                        <span>{label}</span>
                      </div>
                      <span className="text-gray-200 font-semibold capitalize">{value}</span>
                    </div>
                  ))}
                </div>

                {selectedNode.dependencies.length > 0 && (
                  <div className="border-t border-white/5 pt-3 space-y-2">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Dependencies</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.dependencies.map((dep) => (
                        <span key={dep} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[9px] text-gray-400">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> AI Analysis
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    {selectedNode.risk === "HIGH"
                      ? `${selectedNode.name} shows elevated risk. ${selectedNode.complexity > 60 ? "High cyclomatic complexity detected. " : ""}Review security and dependency chains carefully.`
                      : selectedNode.health >= 90
                      ? `${selectedNode.name} is in excellent health. Low complexity, clean dependency boundaries.`
                      : `${selectedNode.name} has moderate health. Monitor for complexity growth as the codebase scales.`}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-xs text-gray-600 py-12 space-y-2">
                <Orbit className="h-10 w-10 text-gray-700 animate-pulse" />
                <p>Click a node in the galaxy to inspect its properties</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
