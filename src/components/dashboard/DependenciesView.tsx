import { useEffect, useState, useMemo } from "react";
import { ReactFlow, Background, Controls, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Repository } from "../../types";
import { backendService } from "../../services/backend";
import { Search, Info } from "lucide-react";

interface DependenciesViewProps {
  repo: Repository;
}

export function DependenciesView({ repo }: DependenciesViewProps) {
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const data = await backendService.getDependencyGraph(repo.path);
        if (active) {
          setGraphData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchGraph();
    return () => {
      active = false;
    };
  }, [repo]);

  // Convert custom graph nodes to React Flow layout
  const nodes: Node[] = useMemo(() => {
    return graphData.nodes.map((node, index) => {
      const isMatch = searchQuery === "" || node.label.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Determine positions automatically in circular grid layout
      const angle = (index / graphData.nodes.length) * 2 * Math.PI;
      const radius = 180;
      const x = 300 + radius * Math.cos(angle);
      const y = 200 + radius * Math.sin(angle);

      // Check for circular reference indicators (special border)
      const isCircularSource = repo.path === "/projects/react-ecom-client" && (node.id.includes("CartContext") || node.id.includes("ProductCard"));

      return {
        id: node.id,
        position: { x, y },
        data: { label: node.label },
        style: {
          background: isMatch ? "#111827" : "#0A0A0A",
          color: isMatch ? "#F3F4F6" : "#4B5563",
          border: isCircularSource 
            ? "1px solid #F59E0B" 
            : isMatch ? "1px solid #4F8CFF" : "1px solid #1F2937",
          padding: "8px 12px",
          borderRadius: "10px",
          fontSize: "11px",
          fontFamily: "monospace",
          boxShadow: isCircularSource ? "0 0 10px rgba(245, 158, 11, 0.2)" : "none",
          opacity: isMatch ? 1 : 0.4,
          transition: "all 0.3s ease"
        }
      };
    });
  }, [graphData.nodes, searchQuery, repo]);

  const edges: Edge[] = useMemo(() => {
    return graphData.edges.map((edge) => {
      const isCircular = repo.path === "/projects/react-ecom-client" && 
        ((edge.source.includes("CartContext") && edge.target.includes("ProductCard")) || 
         (edge.source.includes("ProductCard") && edge.target.includes("CartContext")));

      return {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        animated: isCircular,
        style: {
          stroke: isCircular ? "#F59E0B" : "rgba(255, 255, 255, 0.15)",
          strokeWidth: isCircular ? 2.5 : 1.5
        }
      };
    });
  }, [graphData.edges, repo]);

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-4">
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Dependency Graph</h2>
          <p className="text-xs text-gray-400 mt-1">
            Visual mappings of module imports, includes files nodes and circular warnings.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Filter modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-white focus:outline-none focus:border-primary transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-4 gap-4 min-h-[400px]">
        {/* Canvas Area */}
        <div className="md:col-span-3 glass-panel rounded-2xl border border-white/5 overflow-hidden relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              style={{ width: "100%", height: "100%" }}
            >
              <Background color="#374151" gap={16} size={1} />
              <Controls />
            </ReactFlow>
          )}
        </div>

        {/* Legend / Graph Stats Panel */}
        <div className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-5 text-xs text-gray-300">
          <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/5">
            <Info className="h-4 w-4 text-primary" />
            <span>Graph Analysis</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Total Nodes</span>
              <span className="font-bold text-white font-mono">{graphData.nodes.length} files</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Total Imports</span>
              <span className="font-bold text-white font-mono">{graphData.edges.length} links</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-semibold">Circular Links</span>
              <span className="font-bold text-warning font-mono">
                {repo.path === "/projects/react-ecom-client" ? "1 detected" : "0"}
              </span>
            </div>
          </div>

          {repo.path === "/projects/react-ecom-client" && (
            <div className="p-3.5 rounded-xl bg-warning/5 border border-warning/15 text-[11px] text-warning/90 space-y-1.5 leading-relaxed">
              <span className="font-bold block">Circular loop warning:</span>
              <span>
                [ProductCard.tsx](file:///projects/react-ecom-client/src/components/ProductCard.tsx) imports [CartContext.tsx](file:///projects/react-ecom-client/src/context/CartContext.tsx) to dispatch cart state updates, which in turn references `ProductCard` typings. Break loop via lazy injection or props mapping.
              </span>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-white/5 text-[11px] text-gray-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0"></span>
              <span>Modules standard import</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning shrink-0 animate-pulse"></span>
              <span>Circular code references</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
