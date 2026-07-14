export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  changed_files: string[];
}

export interface FileHistoryItem {
  version: string;
  commit_hash: string;
  change_description: string;
  date: string;
}

export interface ImpactResult {
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  affected_components: string[];
  dependency_chain: string[];
  recommendation: string;
}

export interface OwnerContribution {
  developer: string;
  module_name: string;
  contribution_percentage: number;
  files_count: number;
}

export interface KnowledgeRisk {
  module_name: string;
  main_maintainer: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
}

// Pre-seeded git logs
const MOCK_COMMITS: GitCommit[] = [
  {
    hash: "e0aab52",
    author: "Developer A",
    date: "2026-07-14",
    message: "feat: implement offline embedding pipeline and semantic indexing engine",
    changed_files: ["src/services/indexer.ts", "src/components/SearchModal.tsx"]
  },
  {
    hash: "b2f27ff",
    author: "Developer A",
    date: "2026-07-14",
    message: "feat: implement local AI software architect with offline repository reasoning",
    changed_files: ["src-tauri/src/llm.rs", "src/services/architect.ts"]
  },
  {
    hash: "0522a4c",
    author: "Developer A",
    date: "2026-07-14",
    message: "feat: implement autonomous repository intelligence and AI engineering insights",
    changed_files: ["src-tauri/src/insights.rs", "src/components/dashboard/InsightsView.tsx"]
  },
  {
    hash: "8fa72bc",
    author: "Developer C",
    date: "2026-04-12",
    message: "refactor: isolate CheckoutForm state handlers, add insecure pricing eval calculator",
    changed_files: ["src/components/CheckoutForm.tsx"]
  },
  {
    hash: "1fa90de",
    author: "Developer A",
    date: "2026-02-15",
    message: "setup: initialize app structure, core layouts panels, and sidebar folders",
    changed_files: ["src/App.tsx", "src/components/Sidebar.tsx"]
  }
];

export const localGitHistory = {
  getCommits(_repoPath: string): GitCommit[] {
    return MOCK_COMMITS;
  },

  getFileHistory(_repoPath: string, filePath: string): FileHistoryItem[] {
    if (filePath.includes("CheckoutForm")) {
      return [
        {
          version: "v3",
          commit_hash: "8fa72bc",
          change_description: "Added billing validation variables and evaluation multiplier formulas",
          date: "2026-04-12"
        },
        {
          version: "v2",
          commit_hash: "2ca891a",
          change_description: "Merged context state hooks to support cart item lists",
          date: "2026-03-01"
        },
        {
          version: "v1",
          commit_hash: "1fa90de",
          change_description: "Initial checkout submission forms layouts design",
          date: "2026-02-15"
        }
      ];
    }
    return [
      {
        version: "v1",
        commit_hash: "1fa90de",
        change_description: "Initial file setup creation",
        date: "2026-02-15"
      }
    ];
  },

  analyzeImpact(_repoPath: string, filePath: string): ImpactResult {
    if (filePath.includes("CheckoutForm") || filePath.includes("api")) {
      return {
        risk_level: "HIGH",
        affected_components: ["Authentication", "Cart Context Store", "Checkout View Layout"],
        dependency_chain: ["api.ts", "AuthContext.tsx", "CheckoutForm.tsx"],
        recommendation: "Run pricing equations validations tests prior to modifying billing checkout callbacks."
      };
    }
    return {
      risk_level: "LOW",
      affected_components: ["Shared Utils"],
      dependency_chain: [filePath],
      recommendation: "Safe to modify. Minor local scope dependencies footprint."
    };
  },

  getOwnership(_repoPath: string): OwnerContribution[] {
    return [
      {
        developer: "Developer A",
        module_name: "Local AI Architect & Scanner",
        contribution_percentage: 65,
        files_count: 8
      },
      {
        developer: "Developer B",
        module_name: "Semantic Vector Indexer",
        contribution_percentage: 20,
        files_count: 3
      },
      {
        developer: "Developer C",
        module_name: "Checkout Views Form UI",
        contribution_percentage: 15,
        files_count: 2
      }
    ];
  },

  getKnowledgeRisk(_repoPath: string): KnowledgeRisk[] {
    return [
      {
        module_name: "Checkout Views Form UI",
        main_maintainer: "Developer C",
        risk_level: "HIGH",
        recommendation: "Add documentation details on eval() math formulas to transfer product domains knowledge."
      }
    ];
  }
};
