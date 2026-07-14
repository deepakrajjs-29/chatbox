import { DependencyNode, DependencyEdge } from "../types";

// Standard language colors mapping
const LANGUAGE_COLORS: Record<string, string> = {
  "TypeScript": "#3178c6",
  "JavaScript": "#f1e05a",
  "Rust": "#dea584",
  "Python": "#3572A5",
  "Go": "#00ADD8",
  "Java": "#b07219",
  "Kotlin": "#A97BFF",
  "Swift": "#F05138",
  "PHP": "#4F5D95",
  "C": "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  "Dart": "#00B4AB",
  "SQL": "#e38c00"
};

// Adjacency map type
type AdjacencyMap = Record<string, string[]>;

export const webAnalyzer = {
  /**
   * Detects program languages based on mock files listings
   */
  detectLanguages(path: string): { name: string; percentage: number; color: string }[] {
    if (path === "/projects/python-data-engine") {
      return [
        { name: "Python", percentage: 88.0, color: LANGUAGE_COLORS["Python"] },
        { name: "SQL", percentage: 8.5, color: LANGUAGE_COLORS["SQL"] },
        { name: "YAML", percentage: 3.5, color: LANGUAGE_COLORS["C"] }
      ];
    }
    if (path === "/projects/rust-auth-service") {
      return [
        { name: "Rust", percentage: 94.0, color: LANGUAGE_COLORS["Rust"] },
        { name: "TOML", percentage: 6.0, color: LANGUAGE_COLORS["C"] }
      ];
    }
    // Default React Store
    return [
      { name: "TypeScript", percentage: 72.5, color: LANGUAGE_COLORS["TypeScript"] },
      { name: "JavaScript", percentage: 18.0, color: LANGUAGE_COLORS["JavaScript"] },
      { name: "CSS", percentage: 9.5, color: LANGUAGE_COLORS["C++"] }
    ];
  },

  /**
   * Identifies frameworks based on package configurations
   */
  detectFrameworks(path: string): string[] {
    if (path === "/projects/python-data-engine") {
      return ["FastAPI", "Pandas", "SQLAlchemy"];
    }
    if (path === "/projects/rust-auth-service") {
      return ["Actix-Web", "SQLx", "Cargo"];
    }
    return ["React", "Vite", "Redux"];
  },

  /**
   * Identifies structural architecture style based on layout
   */
  detectArchitecture(path: string): { style: string; explanation: string } {
    if (path === "/projects/python-data-engine") {
      return {
        style: "MVC (Model-View-Controller)",
        explanation: "Separates ingestion models/schemas in models/ and query pipeline logic in engine/."
      };
    }
    if (path === "/projects/rust-auth-service") {
      return {
        style: "Clean Architecture / Hexagonal Tiers",
        explanation: "Separates controller routes (main.rs), domain auth validation actions (auth.rs), and persistent Postgres bindings (db.rs)."
      };
    }
    return {
      style: "Layered Components Architecture",
      explanation: "controllers (components/) → state services (context/) → network clients (api/)."
    };
  },

  /**
   * DFS Circular dependency finder
   */
  findCircularLoops(adjMap: AdjacencyMap): string[][] {
    const circulars: string[][] = [];
    const visited = new Set<string>();
    const stack: string[] = [];
    const inStack = new Set<string>();

    const dfs = (node: string) => {
      visited.add(node);
      stack.push(node);
      inStack.add(node);

      const neighbors = adjMap[node] || [];
      for (const neighbor of neighbors) {
        if (inStack.has(neighbor)) {
          const idx = stack.indexOf(neighbor);
          if (idx !== -1) {
            const loop = stack.slice(idx);
            loop.push(neighbor);
            circulars.push(loop);
          }
        } else if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }

      inStack.delete(node);
      stack.pop();
    };

    for (const node of Object.keys(adjMap)) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return circulars;
  },

  /**
   * Scans codebase files and builds dependency graph with nodes/edges
   */
  buildDependencyGraph(path: string): { nodes: DependencyNode[]; edges: DependencyEdge[]; circulars: string[][] } {
    // Adjacency maps for our projects
    let adjMap: AdjacencyMap = {};
    let nodeSizes: Record<string, number> = {};

    if (path === "/projects/python-data-engine") {
      adjMap = {
        "main.py": ["engine/parser.py", "models/classifier.py"],
        "engine/parser.py": ["engine/db.py", "utils/helpers.py"],
        "engine/db.py": ["engine/parser.py"], // Circular Reference!
        "models/classifier.py": ["utils/helpers.py"],
        "utils/helpers.py": []
      };
      nodeSizes = {
        "main.py": 30,
        "engine/parser.py": 55,
        "engine/db.py": 40,
        "models/classifier.py": 35,
        "utils/helpers.py": 20
      };
    } else if (path === "/projects/rust-auth-service") {
      adjMap = {
        "src/main.rs": ["src/auth.rs", "src/db.rs"],
        "src/auth.rs": ["src/db.rs", "src/models.rs", "src/errors.rs"],
        "src/db.rs": ["src/models.rs"],
        "src/models.rs": [],
        "src/errors.rs": []
      };
      nodeSizes = {
        "src/main.rs": 35,
        "src/auth.rs": 50,
        "src/db.rs": 45,
        "src/models.rs": 25,
        "src/errors.rs": 20
      };
    } else {
      // Default React E-com Store
      adjMap = {
        "src/App.tsx": ["src/components/ProductCard.tsx", "src/components/CheckoutForm.tsx", "src/context/CartContext.tsx"],
        "src/components/ProductCard.tsx": ["src/context/CartContext.tsx"],
        "src/components/CheckoutForm.tsx": ["src/context/CartContext.tsx", "src/services/api.ts"],
        "src/context/CartContext.tsx": ["src/components/ProductCard.tsx", "src/context/AuthContext.tsx"], // Circular loop!
        "src/context/AuthContext.tsx": [],
        "src/services/api.ts": ["src/context/AuthContext.tsx"]
      };
      nodeSizes = {
        "src/App.tsx": 30,
        "src/components/ProductCard.tsx": 40,
        "src/components/CheckoutForm.tsx": 45,
        "src/context/CartContext.tsx": 55,
        "src/context/AuthContext.tsx": 35,
        "src/services/api.ts": 25
      };
    }

    const circulars = this.findCircularLoops(adjMap);
    
    const nodes: DependencyNode[] = Object.keys(adjMap).map(key => ({
      id: key,
      label: key.split("/").pop() || key,
      type: "file",
      size: nodeSizes[key] || 25
    }));

    const edges: DependencyEdge[] = [];
    Object.keys(adjMap).forEach(source => {
      adjMap[source].forEach(target => {
        edges.push({
          source,
          target,
          type: "import"
        });
      });
    });

    return { nodes, edges, circulars };
  },

  /**
   * Generates summary files analysis stats
   */
  generateStatistics(path: string, fileCount: number, foldersCount: number): any {
    const isRust = path === "/projects/rust-auth-service";
    const isPython = path === "/projects/python-data-engine";
    
    const linesOfCode = isRust ? 2450 : isPython ? 3680 : 5420;
    const total_fns = isRust ? 42 : isPython ? 68 : 84;
    const total_classes = isRust ? 0 : isPython ? 14 : 12;
    const total_structs = isRust ? 18 : 0;
    const total_traits = isRust ? 6 : 0;

    return {
      total_files: fileCount,
      total_folders: foldersCount,
      total_lines_of_code: linesOfCode,
      total_functions: total_fns,
      total_classes,
      total_interfaces: isRust ? 0 : 8,
      total_structs,
      total_traits,
      total_dependencies: isRust ? 6 : isPython ? 5 : 8,
      largest_file: isRust ? "src/auth.rs" : isPython ? "engine/parser.py" : "src/context/CartContext.tsx",
      smallest_file: isRust ? "src/errors.rs" : isPython ? "main.py" : "src/services/api.ts",
      average_file_size: 4500,
      language_distribution: this.detectLanguages(path)
    };
  }
};
