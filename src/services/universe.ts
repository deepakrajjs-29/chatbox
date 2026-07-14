export interface VisualizationNode {
  id: string;
  name: string;
  node_type: string; // "module" | "component" | "database" | "external" | "file"
  language: string;
  health: number;       // 0-100 score
  complexity: number;   // 0-100 score
  risk: string;       // "HIGH" | "MEDIUM" | "LOW"
  dependencies: string[];
  owner: string;
}

export interface VisualizationEdge {
  source: string;
  target: string;
  relationship: string; // "import" | "call" | "reads" | "writes"
  weight: number;
  risk: string;
}

export interface ExecutionStep {
  step_number: number;
  name: string;
  file_path: string;
  description: string;
}

export interface HeatmapFolder {
  path: string;
  size: number;
  complexity: number;
  bugs_count: number;
  health_color: string; // "green" | "yellow" | "red"
}

export interface CodebaseUniverse {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  execution_flows: ExecutionStep[];
  health_heatmap: HeatmapFolder[];
}

export const localUniverse = {
  getUniverse(repoPath: string): CodebaseUniverse {
    const isPython = repoPath.includes("python");
    
    if (isPython) {
      return {
        nodes: [
          {
            id: "main_py",
            name: "main.py",
            node_type: "module",
            language: "Python",
            health: 90,
            complexity: 20,
            risk: "LOW",
            dependencies: ["parser_py", "classifier_py"],
            owner: "Developer A"
          },
          {
            id: "parser_py",
            name: "engine/parser.py",
            node_type: "module",
            language: "Python",
            health: 78,
            complexity: 88,
            risk: "MEDIUM",
            dependencies: ["db_py", "helpers_py"],
            owner: "Developer A"
          },
          {
            id: "db_py",
            name: "engine/db.py",
            node_type: "database",
            language: "Python",
            health: 65,
            complexity: 40,
            risk: "HIGH",
            dependencies: ["parser_py"], // circular
            owner: "Developer C"
          },
          {
            id: "helpers_py",
            name: "utils/helpers.py",
            node_type: "component",
            language: "Python",
            health: 95,
            complexity: 15,
            risk: "LOW",
            dependencies: [],
            owner: "Developer B"
          }
        ],
        edges: [
          { source: "main_py", target: "parser_py", relationship: "import", weight: 6, risk: "LOW" },
          { source: "parser_py", target: "db_py", relationship: "call", weight: 9, risk: "HIGH" },
          { source: "db_py", target: "parser_py", relationship: "call", weight: 3, risk: "HIGH" }, // circular
          { source: "parser_py", target: "helpers_py", relationship: "import", weight: 2, risk: "LOW" }
        ],
        execution_flows: [
          {
            step_number: 1,
            name: "Start Python Engine",
            file_path: "main.py",
            description: "Entry point parses parameters and runs watcher daemon."
          },
          {
            step_number: 2,
            name: "Directory watcher scans files",
            file_path: "engine/parser.py",
            description: "Spawns file pool readers loading records dynamically via pandas."
          },
          {
            step_number: 3,
            name: "Verify constraints",
            file_path: "utils/helpers.py",
            description: "Sanitizes data values formats."
          },
          {
            step_number: 4,
            name: "PostgreSQL Database commit",
            file_path: "engine/db.py",
            description: "Commits batch values via SQL query. Triggers vulnerable string formatting."
          }
        ],
        health_heatmap: [
          { path: "engine", size: 34000, complexity: 75, bugs_count: 2, health_color: "red" },
          { path: "models", size: 12000, complexity: 45, bugs_count: 0, health_color: "green" },
          { path: "utils", size: 5400, complexity: 18, bugs_count: 0, health_color: "green" }
        ]
      };
    }

    // Default: React Store
    return {
      nodes: [
        {
          id: "api_service",
          name: "api.ts",
          node_type: "external",
          language: "TypeScript",
          health: 76,
          complexity: 30,
          risk: "HIGH",
          dependencies: ["auth_context"],
          owner: "Developer B"
        },
        {
          id: "auth_context",
          name: "AuthContext.tsx",
          node_type: "module",
          language: "TypeScript",
          health: 90,
          complexity: 45,
          risk: "LOW",
          dependencies: [],
          owner: "Developer A"
        },
        {
          id: "checkout_form",
          name: "CheckoutForm.tsx",
          node_type: "component",
          language: "TypeScript",
          health: 62,
          complexity: 78,
          risk: "HIGH",
          dependencies: ["cart_context", "api_service"],
          owner: "Developer C"
        },
        {
          id: "cart_context",
          name: "CartContext.tsx",
          node_type: "module",
          language: "TypeScript",
          health: 80,
          complexity: 65,
          risk: "MEDIUM",
          dependencies: ["auth_context"],
          owner: "Developer A"
        }
      ],
      edges: [
        {
          source: "checkout_form",
          target: "cart_context",
          relationship: "call",
          weight: 5,
          risk: "MEDIUM"
        },
        {
          source: "checkout_form",
          target: "api_service",
          relationship: "import",
          weight: 8,
          risk: "HIGH"
        },
        {
          source: "cart_context",
          target: "auth_context",
          relationship: "import",
          weight: 3,
          risk: "LOW"
        }
      ],
      execution_flows: [
        {
          step_number: 1,
          name: "Button Click Submit",
          file_path: "CheckoutForm.tsx",
          description: "User clicks the pay button, triggering onSubmit wrapper."
        },
        {
          step_number: 2,
          name: "Pricing Calculation",
          file_path: "CheckoutForm.tsx",
          description: "Calculates total cost using dynamic eval multipliers."
        },
        {
          step_number: 3,
          name: "API Request dispatch",
          file_path: "api.ts",
          description: "Sends JSON payload containing total and auth headers to payments gateway."
        },
        {
          step_number: 4,
          name: "Cart Cache Clear",
          file_path: "CartContext.tsx",
          description: "Triggers clearCart() state resets upon receiving successful HTTP response."
        }
      ],
      health_heatmap: [
        { path: "src/components", size: 45000, complexity: 68, bugs_count: 3, health_color: "yellow" },
        { path: "src/context", size: 28000, complexity: 55, bugs_count: 1, health_color: "green" },
        { path: "src/services", size: 15400, complexity: 72, bugs_count: 2, health_color: "red" },
        { path: "src/utils", size: 8900, complexity: 25, bugs_count: 0, health_color: "green" }
      ]
    };
  }
};
