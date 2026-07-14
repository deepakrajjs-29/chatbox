import { 
  Repository, 
  RecentRepo, 
  RepoFile, 
  RepoFolder, 
  DependencyNode, 
  DependencyEdge, 
  BugHotspot, 
  SecurityVulnerability, 
  RoadmapStep, 
  ChatMessage,
  RepositoryInsights,
  HealthScore,
  ComplexityFinding,
  CodeSmell,
  SecurityScanFinding,
  GitCommit,
  FileHistoryItem,
  ImpactResult,
  OwnerContribution,
  KnowledgeRisk,
  VisualizationNode,
  ExecutionStep,
  HeatmapFolder,
  CodebaseUniverse
} from "../types";
import { webAnalyzer } from "./analyzer";
import { localIndexer } from "./indexer";
import { localArchitect } from "./architect";
import { localInsights } from "./insights";
import { localGitHistory } from "./gitHistory";
import { localUniverse } from "./universe";

// Helper to determine if we are running in Tauri
export const isTauri = (): boolean => {
  return typeof window !== "undefined" && (window as any).__TAURI__ !== undefined;
};

// --- MOCK DATA FOR THE WEB PREVIEW ---
export const MOCK_REPOS = [
  {
    path: "/projects/react-ecom-client",
    name: "react-ecom-client",
    branch: "main",
    commitCount: 342,
    fileCount: 42,
    foldersCount: 8,
    sizeBytes: 1540000,
    languages: [
      { name: "TypeScript", percentage: 72.5, color: "#3178c6" },
      { name: "JavaScript", percentage: 18.0, color: "#f1e05a" },
      { name: "CSS", percentage: 9.5, color: "#563d7c" }
    ],
    frameworks: ["React", "Vite", "Redux"],
    packageManager: "npm",
    buildTool: "Vite",
    architectureStyle: "Layered Components"
  },
  {
    path: "/projects/python-data-engine",
    name: "python-data-engine",
    branch: "dev",
    commitCount: 189,
    fileCount: 28,
    foldersCount: 5,
    sizeBytes: 890000,
    languages: [
      { name: "Python", percentage: 88.0, color: "#3572A5" },
      { name: "SQL", percentage: 8.5, color: "#e38c00" },
      { name: "YAML", percentage: 3.5, color: "#cb171e" }
    ],
    frameworks: ["Pandas", "FastAPI", "SQLAlchemy"],
    packageManager: "pip",
    buildTool: "Poetry",
    architectureStyle: "MVC"
  },
  {
    path: "/projects/rust-auth-service",
    name: "rust-auth-service",
    branch: "master",
    commitCount: 95,
    fileCount: 15,
    foldersCount: 3,
    sizeBytes: 450000,
    languages: [
      { name: "Rust", percentage: 94.0, color: "#dea584" },
      { name: "TOML", percentage: 6.0, color: "#9c9c9c" }
    ],
    frameworks: ["Actix-Web", "SQLx"],
    packageManager: "cargo",
    buildTool: "Cargo",
    architectureStyle: "Hexagonal / Clean"
  }
];

// Mock folder details
const MOCK_FOLDERS: Record<string, Record<string, RepoFolder>> = {
  "/projects/react-ecom-client": {
    "root": {
      path: "/",
      name: "react-ecom-client",
      purpose: "Frontend application client for a premium E-Commerce shop, utilizing modern state management and hooks.",
      responsibilities: ["User interface rendering", "Cart state management", "Checkout flow integration"],
      dependencies: ["src/components", "src/context", "src/hooks"],
      importantFiles: ["package.json", "vite.config.ts", "index.html"],
      riskLevel: "low"
    },
    "src/components": {
      path: "src/components",
      name: "components",
      purpose: "Contains reusable UI elements and layouts for products, cart, and general layout.",
      responsibilities: ["Render product cards", "Handle cart listing user interaction", "Display modals and buttons"],
      dependencies: ["src/context", "src/types"],
      importantFiles: ["ProductCard.tsx", "CartModal.tsx", "CheckoutForm.tsx"],
      riskLevel: "medium"
    },
    "src/context": {
      path: "src/context",
      name: "context",
      purpose: "Provides global state providers for authentication and shopping cart storage.",
      responsibilities: ["Store cart products in localStorage", "Manage checkout token validation", "Provide useCart state"],
      dependencies: [],
      importantFiles: ["CartContext.tsx", "AuthContext.tsx"],
      riskLevel: "high"
    }
  },
  "/projects/python-data-engine": {
    "root": {
      path: "/",
      name: "python-data-engine",
      purpose: "Data ingestion pipeline engine parsing files, performing classification, and writing results to database.",
      responsibilities: ["Queue files ingestion", "Train and predict classifications", "Query engine database"],
      dependencies: ["engine", "models", "utils"],
      importantFiles: ["main.py", "pyproject.toml"],
      riskLevel: "medium"
    },
    "engine": {
      path: "engine",
      name: "engine",
      purpose: "Core ingestion database logic and stream pipeline.",
      responsibilities: ["Process csv/json files in chunks", "Validate table schemas", "Execute async DB writes"],
      dependencies: ["utils"],
      importantFiles: ["parser.py", "db.py"],
      riskLevel: "high"
    }
  },
  "/projects/rust-auth-service": {
    "root": {
      path: "/",
      name: "rust-auth-service",
      purpose: "High-performance microservice executing secure user logins and authorization token validation.",
      responsibilities: ["Expose token generation endpoints", "Verify password hash matches", "Create connection pool to Postgres"],
      dependencies: ["src"],
      importantFiles: ["Cargo.toml", "src/main.rs"],
      riskLevel: "low"
    },
    "src": {
      path: "src",
      name: "src",
      purpose: "Source folder containing routing controllers, security logic, and sql execution handlers.",
      responsibilities: ["JWT token signing", "Password argon2 hashing", "Database pool controller"],
      dependencies: [],
      importantFiles: ["main.rs", "auth.rs", "db.rs"],
      riskLevel: "medium"
    }
  }
};

// Mock files details
const MOCK_FILES: Record<string, Record<string, RepoFile>> = {
  "/projects/react-ecom-client": {
    "src/components/ProductCard.tsx": {
      path: "src/components/ProductCard.tsx",
      name: "ProductCard.tsx",
      sizeBytes: 4200,
      extension: "tsx",
      codeLineCount: 120,
      complexityScore: 35,
      purpose: "Renders product grid item with title, price, image, rating, and 'Add to Cart' button.",
      summary: "This file presents product metadata and hooks directly into the React context of the shopping cart to dispatch product additions.",
      functions: [
        { name: "ProductCard", line: 15, complexity: "low" },
        { name: "handleAddToCart", line: 45, complexity: "medium" }
      ],
      classes: [],
      dependencies: ["src/context/CartContext.tsx", "src/components/ui/Button.tsx", "lucide-react"],
      issues: [
        { type: "info", message: "Consider lazy loading the product images", line: 55 }
      ]
    },
    "src/context/CartContext.tsx": {
      path: "src/context/CartContext.tsx",
      name: "CartContext.tsx",
      sizeBytes: 8100,
      extension: "tsx",
      codeLineCount: 220,
      complexityScore: 78,
      purpose: "Context provider tracking products added to the shopping cart, updating quantities, and applying discounts.",
      summary: "Declares the CartContext state, mounts the CartProvider, and reads/writes item counts in local storage. Includes complex calculation logic for discounts.",
      functions: [
        { name: "CartProvider", line: 20, complexity: "high" },
        { name: "addToCart", line: 85, complexity: "medium" },
        { name: "removeFromCart", line: 120, complexity: "low" },
        { name: "applyCouponCode", line: 150, complexity: "high" }
      ],
      classes: [],
      dependencies: ["react", "src/types/index.ts"],
      issues: [
        { type: "warning", message: "Circular import dependency with ProductCard.tsx", line: 5 },
        { type: "warning", message: "Potential race condition in localStorage writes under heavy rapid updates", line: 90 }
      ]
    },
    "src/services/api.ts": {
      path: "src/services/api.ts",
      name: "api.ts",
      sizeBytes: 3100,
      extension: "ts",
      codeLineCount: 85,
      complexityScore: 40,
      purpose: "Axios client configuring standard backend endpoints and injecting request authentication headers.",
      summary: "Defines base API request instance. Contains authorization token checks and fetches list of items.",
      functions: [
        { name: "fetchProducts", line: 15, complexity: "low" },
        { name: "loginUser", line: 45, complexity: "medium" }
      ],
      classes: [],
      dependencies: ["axios"],
      issues: [
        { type: "error", message: "Hardcoded API secret token found directly in config object", line: 8 }
      ]
    }
  },
  "/projects/python-data-engine": {
    "engine/parser.py": {
      path: "engine/parser.py",
      name: "parser.py",
      sizeBytes: 18400,
      extension: "py",
      codeLineCount: 450,
      complexityScore: 92,
      purpose: "Parses input files (CSV, JSON, XML), validates schemas, and processes items in worker pools.",
      summary: "Contains a large class that handles directory watching, parsing logs, handling schema mismatches, and multi-threading batches.",
      functions: [
        { name: "DataPipeline.watch_directory", line: 45, complexity: "medium" },
        { name: "DataPipeline.parse_file", line: 120, complexity: "high" },
        { name: "DataPipeline.validate_schema", line: 240, complexity: "high" },
        { name: "DataPipeline.flush_to_db", line: 360, complexity: "medium" }
      ],
      classes: ["DataPipeline"],
      dependencies: ["pandas", "threading", "engine.db"],
      issues: [
        { type: "warning", message: "God class found (DataPipeline has 450 lines of code and multiple responsibilities)", line: 12 },
        { type: "warning", message: "Memory usage spike risk when loading files > 500MB without stream chunks", line: 130 }
      ]
    }
  },
  "/projects/rust-auth-service": {
    "src/auth.rs": {
      path: "src/auth.rs",
      name: "auth.rs",
      sizeBytes: 6500,
      extension: "rs",
      codeLineCount: 180,
      complexityScore: 55,
      purpose: "Executes JWT token tokenization, Argon2 hashing, and login authentication controller logic.",
      summary: "Bridges user input credentials with password verification, issues access tokens, and validates incoming headers.",
      functions: [
        { name: "hash_password", line: 20, complexity: "medium" },
        { name: "verify_password", line: 45, complexity: "medium" },
        { name: "generate_jwt", line: 80, complexity: "low" },
        { name: "authorize_user", line: 110, complexity: "high" }
      ],
      classes: [],
      dependencies: ["jsonwebtoken", "argon2", "chrono"],
      issues: [
        { type: "info", message: "JWT secret token length is below 256 bits in local development config", line: 15 }
      ]
    }
  }
};

// Recent repositories list saved locally
const LOCAL_STORAGE_KEY = "devlens_recent_repos";

// Get Tauri command invoker if Tauri is present
let invokeTauri: any = null;
if (isTauri()) {
  import("@tauri-apps/api/core").then(module => {
    invokeTauri = module.invoke;
  });
}

export const backendService = {
  /**
   * Fetch recent repositories list
   */
  async getRecentRepos(): Promise<RecentRepo[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_recent_repos");
      } catch (err) {
        console.error("Tauri get_recent_repos failed, falling back", err);
      }
    }
    
    // Web Fallback
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    
    // Seed with initial mock history for display
    const seed: RecentRepo[] = [
      {
        path: "/projects/react-ecom-client",
        name: "react-ecom-client",
        lastOpened: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sizeBytes: 1540000,
        language: "TypeScript"
      },
      {
        path: "/projects/python-data-engine",
        name: "python-data-engine",
        lastOpened: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sizeBytes: 890000,
        language: "Python"
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  },

  /**
   * Save a repository path to recents
   */
  async addRecentRepo(path: string, name: string, sizeBytes = 102400, language = "TypeScript"): Promise<RecentRepo[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("add_recent_repo", { path, name });
      } catch (err) {
        console.error("Tauri add_recent_repo failed, falling back", err);
      }
    }
    
    const current = await this.getRecentRepos();
    const updated = current.filter(r => r.path !== path);
    updated.unshift({
      path,
      name,
      lastOpened: new Date().toISOString(),
      sizeBytes,
      language
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Delete a repository from recent list
   */
  async removeRecentRepo(path: string): Promise<RecentRepo[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("remove_recent_repo", { path });
      } catch (err) {
        console.error("Tauri remove_recent_repo failed, falling back", err);
      }
    }
    
    const current = await this.getRecentRepos();
    const updated = current.filter(r => r.path !== path);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Triggers Tauri file picker dialog (simulated in web fallback)
   */
  async pickFolder(): Promise<{ path: string; name: string } | null> {
    if (isTauri()) {
      try {
        const selected = await (window as any).__TAURI__.dialog.open({
          directory: true,
          multiple: false
        });
        if (selected && typeof selected === "string") {
          const name = selected.split(/[/\\]/).pop() || selected;
          return { path: selected, name };
        }
      } catch (err) {
        console.error("Tauri folder picking failed", err);
      }
    }
    
    // In web fallback, return a mock user picked folder
    // Randomly select one of the three template projects
    const chosen = MOCK_REPOS[Math.floor(Math.random() * MOCK_REPOS.length)];
    return { path: chosen.path, name: chosen.name };
  },

  /**
   * Load and analyze local repository (Rust parsing in Tauri mode)
   */
  async loadRepository(path: string): Promise<Repository> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("scan_repository", { path });
      } catch (err) {
        console.error("Tauri scan_repository failed, falling back to web analyzer", err);
      }
    }
    
    // Web Fallback: Wait 1.8 seconds to simulate AST parsing, embeddings generation and SQLite seed
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const name = path.split(/[/\\]/).pop() || "unknown-repository";
    const frameworks = webAnalyzer.detectFrameworks(path);
    const languages = webAnalyzer.detectLanguages(path);
    const arch = webAnalyzer.detectArchitecture(path);
    
    const fileCount = path === "/projects/react-ecom-client" ? 42 : path === "/projects/python-data-engine" ? 28 : 15;
    const foldersCount = path === "/projects/react-ecom-client" ? 8 : path === "/projects/python-data-engine" ? 5 : 3;
    const sizeBytes = path === "/projects/react-ecom-client" ? 1540000 : path === "/projects/python-data-engine" ? 890000 : 450000;
    
    const repo: Repository = {
      path,
      name,
      branch: path === "/projects/python-data-engine" ? "dev" : path === "/projects/rust-auth-service" ? "master" : "main",
      commitCount: path === "/projects/python-data-engine" ? 189 : path === "/projects/rust-auth-service" ? 95 : 342,
      fileCount,
      foldersCount,
      sizeBytes,
      languages,
      frameworks,
      packageManager: path === "/projects/rust-auth-service" ? "cargo" : path === "/projects/python-data-engine" ? "pip" : "npm",
      buildTool: path === "/projects/rust-auth-service" ? "Cargo" : path === "/projects/python-data-engine" ? "Poetry" : "Vite",
      architectureStyle: arch.style
    };

    await this.addRecentRepo(repo.path, repo.name, repo.sizeBytes, languages[0]?.name || "TypeScript");
    
    // Save to simulated LocalStorage cache (.devlens cache mockup)
    localStorage.setItem(`.devlens/analysis_${repo.name}`, JSON.stringify(repo));
    
    return repo;
  },

  /**
   * Fetch details for a specific folder
   */
  async getFolderDetails(repoPath: string, folderPath: string): Promise<RepoFolder> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_folder_details", { repoPath, folderPath });
      } catch (err) {
        console.error("Tauri get_folder_details failed", err);
      }
    }
    
    const repoFolders = MOCK_FOLDERS[repoPath] || MOCK_FOLDERS["/projects/react-ecom-client"];
    const relativePath = folderPath === "" || folderPath === "/" || folderPath === repoPath ? "root" : folderPath;
    return repoFolders[relativePath] || {
      path: folderPath,
      name: folderPath.split("/").pop() || folderPath,
      purpose: "General module folder containing project utilities and code sub-components.",
      responsibilities: ["Core logic components helper functions"],
      dependencies: [],
      importantFiles: [],
      riskLevel: "low"
    };
  },

  /**
   * Fetch metadata and details for a file
   */
  async getFileDetails(repoPath: string, filePath: string): Promise<RepoFile> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_file_details", { repoPath, filePath });
      } catch (err) {
        console.error("Tauri get_file_details failed", err);
      }
    }
    
    const repoFiles = MOCK_FILES[repoPath] || MOCK_FILES["/projects/react-ecom-client"];
    return repoFiles[filePath] || {
      path: filePath,
      name: filePath.split("/").pop() || filePath,
      sizeBytes: 2500,
      extension: filePath.split(".").pop() || "ts",
      codeLineCount: 65,
      complexityScore: 22,
      purpose: "Provides helper logic for data processing.",
      summary: "This file implements exported declarations consumed across parent services.",
      functions: [{ name: "processHelper", line: 12, complexity: "low" }],
      classes: [],
      dependencies: [],
      issues: []
    };
  },

  /**
   * Get dependency graph data
   */
  async getDependencyGraph(repoPath: string): Promise<{ nodes: DependencyNode[]; edges: DependencyEdge[] }> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("dependency_graph", { path: repoPath });
      } catch (err) {
        console.error("Tauri dependency_graph failed, falling back", err);
      }
    }
    
    const { nodes, edges } = webAnalyzer.buildDependencyGraph(repoPath);
    return { nodes, edges };
  },

  /**
   * Scan codebase for complexity and duplicate logic hotspots
   */
  async getBugHotspots(repoPath: string): Promise<BugHotspot[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_bug_hotspots", { repoPath });
      } catch (err) {
        console.error("Tauri get_bug_hotspots failed", err);
      }
    }
    
    if (repoPath === "/projects/python-data-engine") {
      return [
        {
          filePath: "engine/parser.py",
          score: 88,
          reasons: ["God class detected (450 LOC)", "Deeply nested blocks (5 levels)", "High cyclomatic complexity in validation routines"],
          linesOfCode: 450,
          complexity: 92
        },
        {
          filePath: "engine/db.py",
          score: 65,
          reasons: ["Manual connection resource locks", "Unclosed cursor risks in transaction failures"],
          linesOfCode: 150,
          complexity: 60
        }
      ];
    }
    
    if (repoPath === "/projects/rust-auth-service") {
      return [
        {
          filePath: "src/auth.rs",
          score: 45,
          reasons: ["Complex matching structures in session auth handler"],
          linesOfCode: 180,
          complexity: 55
        }
      ];
    }
    
    return [
      {
        filePath: "src/context/CartContext.tsx",
        score: 75,
        reasons: ["State updating loop dependencies", "High nesting inside checkout price algorithms", "Deep recursive component callbacks"],
        linesOfCode: 220,
        complexity: 78
      },
      {
        filePath: "src/components/CheckoutForm.tsx",
        score: 62,
        reasons: ["Multiple async promises executed sequentially without global error handler context"],
        linesOfCode: 165,
        complexity: 65
      }
    ];
  },

  /**
   * Scan files for security secrets and injections
   */
  async getSecurityIssues(repoPath: string): Promise<SecurityVulnerability[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("scan_security", { repoPath });
      } catch (err) {
        console.error("Tauri scan_security failed", err);
      }
    }
    
    if (repoPath === "/projects/python-data-engine") {
      return [
        {
          filePath: "engine/db.py",
          line: 25,
          severity: "high",
          type: "SQL Injection Risk",
          message: "Raw query concatenation using python format strings instead of parameterized SQL statement parameters.",
          snippet: "cursor.execute(f\"SELECT * FROM users WHERE status = '{status}'\")"
        }
      ];
    }
    
    if (repoPath === "/projects/rust-auth-service") {
      return [
        {
          filePath: "Cargo.toml",
          line: 14,
          severity: "medium",
          type: "Insecure Dependency Version",
          message: "Actix-Web version v4.0.0-rc3 has a known security advisory for memory leaks under malformed requests.",
          snippet: "actix-web = \"4.0.0-rc3\""
        }
      ];
    }
    
    return [
      {
        filePath: "src/services/api.ts",
        line: 8,
        severity: "high",
        type: "Hardcoded API Credentials",
        message: "Found potential hardcoded secret key string token, which may be checked into version control.",
        snippet: "const API_SECRET = \"sk_live_MOCK_KEY_REPLACE_ME_0000000000\""
      },
      {
        filePath: "src/components/CheckoutForm.tsx",
        line: 84,
        severity: "high",
        type: "Insecure Code Execution",
        message: "Usage of eval() dynamic parsing string functions executes untrusted user payloads.",
        snippet: "const totalCost = eval(userInputPriceMultiplier + \" * total\");"
      }
    ];
  },

  /**
   * Get learning onboarding steps
   */
  async getLearningRoadmap(repoPath: string): Promise<RoadmapStep[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_learning_roadmap", { repoPath });
      } catch (err) {
        console.error("Tauri get_learning_roadmap failed", err);
      }
    }
    
    if (repoPath === "/projects/python-data-engine") {
      return [
        {
          id: "step1",
          title: "Pipeline Trigger & Configuration",
          description: "Inspect the entry entry point configuration variables and how to set local directories.",
          status: "done",
          files: ["main.py", "pyproject.toml"],
          explanations: [
            "Start by inspecting main.py, which acts as the startup file initializing settings.",
            "Review dependencies in pyproject.toml to understand python run parameters."
          ]
        },
        {
          id: "step2",
          title: "File Ingestion Engine",
          description: "Analyze how incoming CSV and JSON structures are processed in thread workers.",
          status: "current",
          files: ["engine/parser.py"],
          explanations: [
            "DataPipeline is the central orchestrator loading items.",
            "It executes pandas readers in threads to slice rows."
          ]
        },
        {
          id: "step3",
          title: "Database Syncing Layer",
          description: "Trace how tabular chunks are inserted in Postgres databases.",
          status: "todo",
          files: ["engine/db.py"],
          explanations: [
            "Database connections pool is created using SQLAlchemy.",
            "The bulk insert commands execute transactions here."
          ]
        }
      ];
    }
    
    // Default React Store Roadmap
    return [
      {
        id: "step1",
        title: "Global Context State Initialization",
        description: "Examine how shopping cart state and credentials are loaded on app boot.",
        status: "done",
        files: ["src/context/CartContext.tsx", "src/context/AuthContext.tsx"],
        explanations: [
          "CartProvider tracks product arrays and syncs totals with browser local storage.",
          "AuthContext holds active user credentials, loading JWT tokens on startup."
        ]
      },
      {
        id: "step2",
        title: "API Layer",
        description: "Analyze the axios client headers injection structure.",
        status: "current",
        files: ["src/services/api.ts"],
        explanations: [
          "Bridges local context actions with API calls.",
          "Injects bearer JWT tokens into headers automatically."
        ]
      },
      {
        id: "step3",
        title: "Checkout Flow logic",
        description: "Track payment state changes and order creation.",
        status: "todo",
        files: ["src/components/CheckoutForm.tsx"],
        explanations: [
          "Validates card details inputs.",
          "Processes successful charges and calls clearCart() callback."
        ]
      }
    ];
  },

  /**
   * RAG Chat interface with Ollama (streams chunks via callback)
   */
  async sendChatMessage(
    repoPath: string, 
    query: string, 
    history: ChatMessage[], 
    onToken: (token: string) => void
  ): Promise<string> {
    if (isTauri() && invokeTauri) {
      // In Tauri, we'd open a connection or fetch streaming response
      // For now, let's trigger the Tauri RAG channel if exists
      try {
        // Tauri command returning complete response or setting up event stream listener
        const response = await invokeTauri("chat", { repoPath, query, history });
        onToken(response);
        return response;
      } catch (err) {
        console.error("Tauri chat command failed, falling back", err);
      }
    }
    
    // Web Fallback: Execute local dynamic RAG answers builder
    return localArchitect.generateRAGAnswer(repoPath, query, history, onToken);
  },

  /**
   * Semantic Search API Bridge
   */
  async semanticSearch(repoPath: string, query: string, limit = 5): Promise<any[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("semantic_search", { path: repoPath, query, limit });
      } catch (err) {
        console.error("Tauri semantic_search failed, falling back", err);
      }
    }
    
    return localIndexer.hybridSearch(repoPath, query);
  },

  async getRepositoryInsights(repoPath: string): Promise<RepositoryInsights> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_repository_insights", { path: repoPath });
      } catch (err) {
        console.error("Tauri get_repository_insights failed, falling back", err);
      }
    }
    return localInsights.getInsights(repoPath);
  },

  async generateHealthReport(repoPath: string): Promise<HealthScore[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_health_report", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localInsights.getInsights(repoPath).health_scores;
  },

  async analyzeComplexity(repoPath: string): Promise<ComplexityFinding[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("analyze_complexity", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localInsights.getInsights(repoPath).complexity_warnings;
  },

  async detectCodeSmells(repoPath: string): Promise<CodeSmell[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("detect_code_smells", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localInsights.getInsights(repoPath).code_smells;
  },

  async securityScan(repoPath: string): Promise<SecurityScanFinding[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("security_scan", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localInsights.getInsights(repoPath).security_findings;
  },

  async dependencyAnalysis(repoPath: string): Promise<string[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("dependency_analysis", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return [repoPath.includes("python") 
      ? "pip package footings check out. Unused dependency: None." 
      : "lodash usage is minimal (3 functions). Replace with native operations."];
  },

  async generateRefactoringPlan(repoPath: string): Promise<string[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_refactoring_plan", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localInsights.getInsights(repoPath).refactoring_roadmap;
  },

  async testingAnalysis(repoPath: string): Promise<string[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("testing_analysis", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return [
      "AuthenticationService: Priority 1 - handles user login validation.",
      "PaymentProcessor: Priority 2 - handles checkout logic."
    ];
  },

  async architectureRecommendations(repoPath: string): Promise<string> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("architecture_recommendations", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return "Monolithic coupling detected. Move business logic routes into discrete context packages.";
  },

  async analyzeGitHistory(repoPath: string): Promise<GitCommit[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("analyze_git_history", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localGitHistory.getCommits(repoPath);
  },

  async getCommitTimeline(repoPath: string): Promise<GitCommit[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_commit_timeline", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localGitHistory.getCommits(repoPath);
  },

  async getFileHistory(repoPath: string, filePath: string): Promise<FileHistoryItem[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_file_history", { path: repoPath, filePath });
      } catch (err) {
        console.error(err);
      }
    }
    return localGitHistory.getFileHistory(repoPath, filePath);
  },

  async analyzeChangeImpact(repoPath: string, filePath: string): Promise<ImpactResult> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("analyze_change_impact", { path: repoPath, filePath });
      } catch (err) {
        console.error(err);
      }
    }
    return localGitHistory.analyzeImpact(repoPath, filePath);
  },

  async findBugOrigin(repoPath: string, query: string): Promise<string> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("find_bug_origin", { path: repoPath, query });
      } catch (err) {
        console.error(err);
      }
    }
    if (query.includes("pay") || query.includes("checkout")) {
      return "Possible cause: Commit 8fa72bc ('refactor: isolate CheckoutForm state handlers') in paymentService.ts. Validation logic dynamically parsed via eval() causing float operations errors.";
    }
    return "No recent commits matched query intent keywords.";
  },

  async detectFeatureIntroduction(repoPath: string, query: string): Promise<string> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("detect_feature_introduction", { path: repoPath, query });
      } catch (err) {
        console.error(err);
      }
    }
    if (query.includes("auth") || query.includes("jwt")) {
      return "Authentication was introduced in Commit a82f92d ('feat: establish local vector search and nomic text embeddings fallback models') by Developer B on 2026-06-10.";
    }
    return "Feature addition commit not identified in logs.";
  },

  async generateEvolutionReport(repoPath: string): Promise<string> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_evolution_report", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return "Architecture Evolution: Codebase migrated from basic inline modules layouts to decoupled vector index mappings, isolating contexts dependencies.";
  },

  async getCodeOwnership(repoPath: string): Promise<OwnerContribution[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_code_ownership", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localGitHistory.getOwnership(repoPath);
  },

  async calculateKnowledgeRisk(repoPath: string): Promise<KnowledgeRisk[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("calculate_knowledge_risk", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localGitHistory.getKnowledgeRisk(repoPath);
  },

  async gitSemanticSearch(repoPath: string, query: string): Promise<GitCommit[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("git_semantic_search", { path: repoPath, query });
      } catch (err) {
        console.error(err);
      }
    }
    const commits = localGitHistory.getCommits(repoPath);
    const lower = query.toLowerCase();
    return commits.filter(c => c.message.toLowerCase().includes(lower) || c.hash.toLowerCase().includes(lower));
  },

  async generateArchitectureGraph(repoPath: string): Promise<CodebaseUniverse> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_architecture_graph", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localUniverse.getUniverse(repoPath);
  },

  async generateDependencyMap(repoPath: string): Promise<CodebaseUniverse> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_dependency_map", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localUniverse.getUniverse(repoPath);
  },

  async generateExecutionFlow(repoPath: string): Promise<ExecutionStep[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_execution_flow", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localUniverse.getUniverse(repoPath).execution_flows;
  },

  async generateChangeImpactGraph(repoPath: string): Promise<CodebaseUniverse> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_change_impact_graph", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localUniverse.getUniverse(repoPath);
  },

  async generateHealthHeatmap(repoPath: string): Promise<HeatmapFolder[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_health_heatmap", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localUniverse.getUniverse(repoPath).health_heatmap;
  },

  async generateCodeUniverse(repoPath: string): Promise<CodebaseUniverse> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_code_universe", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localUniverse.getUniverse(repoPath);
  },

  async generateEvolutionTimeline(repoPath: string): Promise<ExecutionStep[]> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("generate_evolution_timeline", { path: repoPath });
      } catch (err) {
        console.error(err);
      }
    }
    return localUniverse.getUniverse(repoPath).execution_flows;
  },

  async getVisualNodeDetails(repoPath: string, nodeId: string): Promise<VisualizationNode | null> {
    if (isTauri() && invokeTauri) {
      try {
        return await invokeTauri("get_visual_node_details", { path: repoPath, nodeId });
      } catch (err) {
        console.error(err);
      }
    }
    const found = localUniverse.getUniverse(repoPath).nodes.find(n => n.id === nodeId);
    return found || null;
  }
};
