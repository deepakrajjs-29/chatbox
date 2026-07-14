import { useMemo } from "react";
import { ReactFlow, Background, Controls, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Repository } from "../../types";

interface ArchitectureViewProps {
  repo: Repository;
}

export function ArchitectureView({ repo }: ArchitectureViewProps) {
  // Generate nodes based on architecture
  const nodes: Node[] = useMemo(() => {
    const isRust = repo.languages[0]?.name === "Rust";
    const isPython = repo.languages[0]?.name === "Python";
    
    if (isRust) {
      return [
        {
          id: "1",
          position: { x: 250, y: 30 },
          data: { label: "Client HTTP Requests (Actix Web)" },
          style: { background: "#1F2937", color: "#F3F4F6", border: "1px solid #4F8CFF", padding: "10px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold" }
        },
        {
          id: "2",
          position: { x: 250, y: 130 },
          data: { label: "Route Controllers (src/main.rs)" },
          style: { background: "#111827", color: "#F3F4F6", border: "1px solid #374151", padding: "10px", borderRadius: "8px", fontSize: "11px" }
        },
        {
          id: "3",
          position: { x: 100, y: 230 },
          data: { label: "JWT Token verification (src/auth.rs)" },
          style: { background: "#111827", color: "#F3F4F6", border: "1px solid #8B5CF6", padding: "10px", borderRadius: "8px", fontSize: "11px" }
        },
        {
          id: "4",
          position: { x: 400, y: 230 },
          data: { label: "Database pool client (src/db.rs)" },
          style: { background: "#111827", color: "#F3F4F6", border: "1px solid #10B981", padding: "10px", borderRadius: "8px", fontSize: "11px" }
        },
        {
          id: "5",
          position: { x: 400, y: 330 },
          data: { label: "PostgreSQL Database Server" },
          style: { background: "#065F46", color: "#ECFDF5", border: "1px solid #047857", padding: "10px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold" }
        }
      ];
    }
    
    if (isPython) {
      return [
        {
          id: "1",
          position: { x: 250, y: 30 },
          data: { label: "Web Entry (FastAPI Server)" },
          style: { background: "#1F2937", color: "#F3F4F6", border: "1px solid #4F8CFF", padding: "10px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold" }
        },
        {
          id: "2",
          position: { x: 250, y: 130 },
          data: { label: "Ingestion Queue (engine/parser.py)" },
          style: { background: "#111827", color: "#F3F4F6", border: "1px solid #374151", padding: "10px", borderRadius: "8px", fontSize: "11px" }
        },
        {
          id: "3",
          position: { x: 100, y: 230 },
          data: { label: "Machine Learning models (models/classifier.py)" },
          style: { background: "#111827", color: "#F3F4F6", border: "1px solid #8B5CF6", padding: "10px", borderRadius: "8px", fontSize: "11px" }
        },
        {
          id: "4",
          position: { x: 400, y: 230 },
          data: { label: "Postgres database connector (engine/db.py)" },
          style: { background: "#111827", color: "#F3F4F6", border: "1px solid #10B981", padding: "10px", borderRadius: "8px", fontSize: "11px" }
        }
      ];
    }
    
    // Default React Store Components
    return [
      {
        id: "1",
        position: { x: 250, y: 30 },
        data: { label: "User UI View (src/App.tsx)" },
        style: { background: "#1F2937", color: "#F3F4F6", border: "1px solid #4F8CFF", padding: "10px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold" }
      },
      {
        id: "2",
        position: { x: 100, y: 130 },
        data: { label: "Shopping grid widget (ProductCard.tsx)" },
        style: { background: "#111827", color: "#F3F4F6", border: "1px solid #374151", padding: "10px", borderRadius: "8px", fontSize: "11px" }
      },
      {
        id: "3",
        position: { x: 400, y: 130 },
        data: { label: "Checkout validation form (CheckoutForm.tsx)" },
        style: { background: "#111827", color: "#F3F4F6", border: "1px solid #374151", padding: "10px", borderRadius: "8px", fontSize: "11px" }
      },
      {
        id: "4",
        position: { x: 250, y: 230 },
        data: { label: "Shopping cart context (CartContext.tsx)" },
        style: { background: "#111827", color: "#F3F4F6", border: "1px solid #8B5CF6", padding: "10px", borderRadius: "8px", fontSize: "11px" }
      },
      {
        id: "5",
        position: { x: 400, y: 330 },
        data: { label: "Axios client config (services/api.ts)" },
        style: { background: "#111827", color: "#F3F4F6", border: "1px solid #10B981", padding: "10px", borderRadius: "8px", fontSize: "11px" }
      }
    ];
  }, [repo]);

  const edges: Edge[] = useMemo(() => {
    const isRust = repo.languages[0]?.name === "Rust";
    const isPython = repo.languages[0]?.name === "Python";

    if (isRust) {
      return [
        { id: "e1-2", source: "1", target: "2", animated: true },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e2-4", source: "2", target: "4" },
        { id: "e4-5", source: "4", target: "5", animated: true }
      ];
    }
    
    if (isPython) {
      return [
        { id: "e1-2", source: "1", target: "2", animated: true },
        { id: "e2-3", source: "2", target: "3" },
        { id: "e2-4", source: "2", target: "4" }
      ];
    }
    
    return [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e1-3", source: "1", target: "3" },
      { id: "e2-4", source: "2", target: "4", animated: true },
      { id: "e3-4", source: "3", target: "4", animated: true },
      { id: "e3-5", source: "3", target: "5" }
    ];
  }, [repo]);

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System Architecture Map</h2>
        <p className="text-xs text-gray-400 mt-1">
          Interactive flow diagram mapping code structural modules. Drag, zoom, and select layers.
        </p>
      </div>

      <div className="flex-1 glass-panel rounded-2xl border border-white/5 overflow-hidden min-h-[400px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          style={{ width: "100%", height: "100%" }}
        >
          <Background color="#374151" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
