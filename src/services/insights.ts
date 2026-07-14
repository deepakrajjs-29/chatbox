export interface HealthScore {
  category: string;
  score: number;
  reason: string;
}

export interface ComplexityFinding {
  file_path: string;
  issue: string;
  impact: string;
  recommendation: string;
}

export interface CodeSmell {
  title: string;
  file_path: string;
  lines: string;
  description: string;
  recommendation: string;
}

export interface SecurityScanFinding {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  file_path: string;
  line_number: number;
  recommendation: string;
}

export interface RepositoryInsights {
  health_scores: HealthScore[];
  complexity_warnings: ComplexityFinding[];
  code_smells: CodeSmell[];
  security_findings: SecurityScanFinding[];
  refactoring_roadmap: string[];
}

export const localInsights = {
  getInsights(repoPath: string): RepositoryInsights {
    const isPython = repoPath.includes("python");
    const isRust = repoPath.includes("rust");

    if (isPython) {
      return {
        health_scores: [
          { category: "Architecture Health", score: 88, reason: "FastAPI endpoints map cleanly. Coupling exists inside engine/db.py." },
          { category: "Security Score", score: 65, reason: "SQL injection query injection risk detected in select_active_users." },
          { category: "Code Quality & Cleanliness", score: 78, reason: "Clean syntax, but files like parser.py contain high cyclomatic blocks." },
          { category: "Maintainability", score: 82, reason: "Logical structure. Low dependencies footprints." },
          { category: "Documentation", score: 40, reason: "Missing module readmes and docstrings on SQL query definitions." },
          { category: "Testing Scope", score: 50, reason: "FastAPI endpoints lack coverage checks." }
        ],
        complexity_warnings: [
          {
            file_path: "engine/parser.py",
            issue: "Thread pool routine schedules multiple nested parsing tasks with deep logic branches.",
            impact: "Higher resource consumption and tricky error recovery paths.",
            recommendation: "Separate validation procedures into structured module callbacks."
          }
        ],
        code_smells: [
          {
            title: "God Component / File",
            file_path: "engine/parser.py",
            lines: "1-450",
            description: "God class handles reading directory, pandas loading, schema validation, and SQL queries.",
            recommendation: "Divide parsing logic and SQL ingestion layers."
          }
        ],
        security_findings: [
          {
            severity: "HIGH",
            title: "SQL Injection Susceptibility",
            file_path: "engine/db.py",
            line_number: 10,
            recommendation: "Use parameterized cursor queries instead of format string concatenations: cursor.execute('SELECT * FROM users WHERE status = %s', (status,))"
          }
        ],
        refactoring_roadmap: [
          "Secure dynamic SQL syntax inside engine/db.py to resolve High severity injection risk.",
          "Split engine/parser.py into folder watcher and pandas parser utilities.",
          "Increase test coverage across FastAPI route functions."
        ]
      };
    }

    if (isRust) {
      return {
        health_scores: [
          { category: "Architecture Health", score: 95, reason: "Strong package bounds. Cargo modular files." },
          { category: "Security Score", score: 90, reason: "Salted password hashes, secure encryption practices." },
          { category: "Code Quality & Cleanliness", score: 88, reason: "Zero unsafe blocks. Clean traits maps." },
          { category: "Maintainability", score: 92, reason: "Explicit errors typing. Low structural coupling." },
          { category: "Documentation", score: 70, reason: "Public API traits are documented. Internal modules missing docs." },
          { category: "Testing Scope", score: 85, reason: "Unit tests check auth logic loops." }
        ],
        complexity_warnings: [],
        code_smells: [],
        security_findings: [],
        refactoring_roadmap: [
          "Document helper functions in auth.rs.",
          "Expand integration test cases covering DB failures handling."
        ]
      };
    }

    // Default: React Store
    return {
      health_scores: [
        { category: "Architecture Health", score: 92, reason: "Layered architecture. Components are nicely split." },
        { category: "Security Score", score: 76, reason: "Hardcoded sk_live credential inside api.ts and eval pricing execution." },
        { category: "Code Quality & Cleanliness", score: 85, reason: "Good naming. Clean layout formats." },
        { category: "Maintainability", score: 80, reason: "Low nesting in views, but CartContext holds state logic loops." },
        { category: "Documentation", score: 54, reason: "Only 20% of helper functions contain comments." },
        { category: "Testing Scope", score: 63, reason: "Unit tests are present for product renders, missing checkout simulations." }
      ],
      complexity_warnings: [
        {
          file_path: "src/components/CheckoutForm.tsx",
          issue: "Form component triggers submission, calculates totals, manages credentials loading, and posts to servers.",
          impact: "Reduces element reusability, increasing code complexity.",
          recommendation: "Move form validation logic into utility helpers and extract fetch queries."
        }
      ],
      code_smells: [
        {
          title: "God Component / File",
          file_path: "src/components/CheckoutForm.tsx",
          lines: "1-165",
          description: "Responsible for inputs binding, pricing math logic, and backend postings.",
          recommendation: "Refactor async posting loops into a shared service hook."
        },
        {
          title: "Duplicate Logic",
          file_path: "src/components/ProductCard.tsx & CheckoutForm.tsx",
          lines: "12-25",
          description: "Duplicated conversion math algorithms found in components views (87% similarity matches).",
          recommendation: "Consolidate currency conversions into a utility class."
        }
      ],
      security_findings: [
        {
          severity: "HIGH",
          title: "Hardcoded API Key / Credentials",
          file_path: "src/services/api.ts",
          line_number: 2,
          recommendation: "Move API_SECRET to environment variables (.env.local) or local keystores."
        },
        {
          severity: "MEDIUM",
          title: "Dangerous Dynamic Code Execution (eval)",
          file_path: "src/components/CheckoutForm.tsx",
          line_number: 18,
          recommendation: "Use standard arithmetic operators or float multiplication instead of eval()."
        }
      ],
      refactoring_roadmap: [
        "Fix API_SECRET leak in src/services/api.ts by migrating to environment variables.",
        "Refactor CheckoutForm.tsx: remove the eval dynamic executor, refactoring checkout Math.",
        "Add unit test cases for the CheckoutForm pricing routines.",
        "Improve component descriptions: add helper comments inside CartContext."
      ]
    };
  }
};
