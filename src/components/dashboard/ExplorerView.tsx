import { useState, useEffect, useMemo } from "react";
import { Repository, RepoFile, RepoFolder } from "../../types";
import { backendService } from "../../services/backend";
import { 
  Folder, 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  ShieldAlert, 
  Activity, 
  Sparkles
} from "lucide-react";

interface ExplorerViewProps {
  repo: Repository;
}

interface FileNode {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileNode[];
}

export function ExplorerView({ repo }: ExplorerViewProps) {
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"file" | "folder">("folder");
  const [folderDetail, setFolderDetail] = useState<RepoFolder | null>(null);
  const [fileDetail, setFileDetail] = useState<RepoFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ "root": true });
  const [loading, setLoading] = useState(false);

  // Generate directory tree based on repo
  const directoryTree: FileNode = useMemo(() => {
    return {
      name: repo.name,
      path: "/",
      isFolder: true,
      children: repo.path === "/projects/python-data-engine" ? [
        { name: "engine", path: "engine", isFolder: true, children: [
          { name: "parser.py", path: "engine/parser.py", isFolder: false },
          { name: "db.py", path: "engine/db.py", isFolder: false }
        ]},
        { name: "models", path: "models", isFolder: true, children: [
          { name: "classifier.py", path: "models/classifier.py", isFolder: false }
        ]},
        { name: "utils", path: "utils", isFolder: true, children: [
          { name: "helpers.py", path: "utils/helpers.py", isFolder: false }
        ]},
        { name: "main.py", path: "main.py", isFolder: false },
        { name: "pyproject.toml", path: "pyproject.toml", isFolder: false }
      ] : repo.path === "/projects/rust-auth-service" ? [
        { name: "src", path: "src", isFolder: true, children: [
          { name: "main.rs", path: "src/main.rs", isFolder: false },
          { name: "auth.rs", path: "src/auth.rs", isFolder: false },
          { name: "db.rs", path: "src/db.rs", isFolder: false },
          { name: "models.rs", path: "src/models.rs", isFolder: false },
          { name: "errors.rs", path: "src/errors.rs", isFolder: false }
        ]},
        { name: "Cargo.toml", path: "Cargo.toml", isFolder: false }
      ] : [
        { name: "src", path: "src", isFolder: true, children: [
          { name: "components", path: "src/components", isFolder: true, children: [
            { name: "ProductCard.tsx", path: "src/components/ProductCard.tsx", isFolder: false },
            { name: "CheckoutForm.tsx", path: "src/components/CheckoutForm.tsx", isFolder: false }
          ]},
          { name: "context", path: "src/context", isFolder: true, children: [
            { name: "CartContext.tsx", path: "src/context/CartContext.tsx", isFolder: false },
            { name: "AuthContext.tsx", path: "src/context/AuthContext.tsx", isFolder: false }
          ]},
          { name: "services", path: "src/services", isFolder: true, children: [
            { name: "api.ts", path: "src/services/api.ts", isFolder: false }
          ]},
          { name: "App.tsx", path: "src/App.tsx", isFolder: false }
        ]},
        { name: "package.json", path: "package.json", isFolder: false },
        { name: "vite.config.ts", path: "vite.config.ts", isFolder: false }
      ]
    };
  }, [repo]);

  const handleSelectNode = async (path: string, isFolder: boolean) => {
    setSelectedPath(path);
    setSelectedType(isFolder ? "folder" : "file");
    setLoading(true);

    try {
      if (isFolder) {
        const detail = await backendService.getFolderDetails(repo.path, path);
        setFolderDetail(detail);
        setFileDetail(null);
      } else {
        const detail = await backendService.getFileDetails(repo.path, path);
        setFileDetail(detail);
        setFolderDetail(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Load root details on start
  useEffect(() => {
    handleSelectNode("/", true);
  }, [repo]);

  // Recursively render directory items
  const renderTree = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders[node.path] || false;
    const isSelected = selectedPath === node.path;
    
    return (
      <div key={node.path} className="select-none">
        <div 
          onClick={() => {
            if (node.isFolder) {
              toggleFolder(node.path);
            }
            handleSelectNode(node.path, node.isFolder);
          }}
          className={`flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer text-xs transition-all ${
            isSelected 
              ? "bg-primary/10 text-primary border border-primary/20" 
              : "text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.isFolder ? (
            <>
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-gray-500"}`} />
            </>
          ) : (
            <>
              <span className="w-3.5"></span>
              <FileCode className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-gray-600"}`} />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        
        {node.isFolder && isExpanded && node.children && (
          <div className="mt-0.5">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Code Explorer</h2>
        <p className="text-xs text-gray-400 mt-1">
          Select directories or specific source files to run offline AI AST code explanation.
        </p>
      </div>

      <div className="flex-1 grid md:grid-cols-5 gap-4 min-h-[420px]">
        {/* Left Side: Directory Tree */}
        <div className="md:col-span-2 glass-panel p-4.5 rounded-2xl border border-white/5 bg-[#0F0F0F] overflow-y-auto max-h-[500px]">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-white/5">
            Project Tree Structure
          </h4>
          <div className="space-y-0.5">
            {renderTree(directoryTree)}
          </div>
        </div>

        {/* Right Side: Detail Analytics */}
        <div className="md:col-span-3 glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col min-h-[420px] max-h-[500px] overflow-y-auto relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : null}

          {/* FOLDER VIEW */}
          {selectedType === "folder" && folderDetail && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase">
                    Folder Analysis
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5 font-mono">{folderDetail.path}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  folderDetail.riskLevel === "high" ? "bg-danger/10 text-danger border-danger/20" :
                  folderDetail.riskLevel === "medium" ? "bg-warning/10 text-warning border-warning/20" :
                  "bg-success/10 text-success border-success/20"
                }`}>
                  {folderDetail.riskLevel} risk
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Purpose */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    Module Purpose
                  </h4>
                  <p className="text-gray-400 leading-relaxed font-medium">{folderDetail.purpose}</p>
                </div>

                {/* Responsibilities */}
                {folderDetail.responsibilities.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-400">Responsibilities</h4>
                    <ul className="space-y-1 list-disc list-inside text-gray-300 pl-1 font-medium">
                      {folderDetail.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sub-Dependencies */}
                {folderDetail.dependencies.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-400">Related Subfolders</h4>
                    <div className="flex flex-wrap gap-2">
                      {folderDetail.dependencies.map((d, i) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-gray-300">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FILE VIEW */}
          {selectedType === "file" && fileDetail && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[9px] font-bold text-accent uppercase">
                    File Analysis
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5 font-mono truncate" title={fileDetail.path}>
                    {fileDetail.name}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                    {fileDetail.codeLineCount} Lines of Code · {(fileDetail.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                
                {/* Complexity Gauge */}
                <div className="glass-panel p-2.5 rounded-xl border border-white/10 flex items-center gap-2 shrink-0">
                  <Activity className={`h-4.5 w-4.5 ${
                    fileDetail.complexityScore > 75 ? "text-danger animate-pulse" :
                    fileDetail.complexityScore > 50 ? "text-warning" : "text-success"
                  }`} />
                  <div>
                    <span className="text-[9px] text-gray-500 block font-semibold uppercase">Complexity</span>
                    <span className="text-xs font-bold text-white">{fileDetail.complexityScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4.5 text-xs">
                {/* Purpose */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    File Purpose
                  </h4>
                  <p className="text-gray-400 leading-relaxed font-medium">{fileDetail.purpose}</p>
                </div>

                {/* Summary */}
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-400">AST Explanations</h4>
                  <p className="text-gray-300 leading-relaxed font-medium">{fileDetail.summary}</p>
                </div>

                {/* Important Functions */}
                {fileDetail.functions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-400">Functions / Methods</h4>
                    <div className="space-y-1.5">
                      {fileDetail.functions.map((fn, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] border border-white/5 font-mono text-[11px]">
                          <span className="text-gray-300 font-bold">{fn.name}() <span className="text-[9px] text-gray-600 font-medium">L{fn.line}</span></span>
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold border capitalize ${
                            fn.complexity === "high" ? "bg-danger/10 text-danger border-danger/20" :
                            fn.complexity === "medium" ? "bg-warning/10 text-warning border-warning/20" :
                            "bg-success/10 text-success border-success/20"
                          }`}>
                            {fn.complexity} complexity
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lint Issues warning */}
                {fileDetail.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-danger/80">Analysis Code Smells</h4>
                    <div className="space-y-1.5">
                      {fileDetail.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-danger/5 border border-danger/15 text-[11px] leading-relaxed text-danger/90">
                          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">L{issue.line}: </span>
                            <span>{issue.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
