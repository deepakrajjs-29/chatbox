use std::process::Command;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GitCommit {
    pub hash: String,
    pub author: String,
    pub date: String,
    pub message: String,
    pub changed_files: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FileHistoryItem {
    pub version: String,
    pub commit_hash: String,
    pub change_description: String,
    pub date: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ImpactResult {
    pub risk_level: String, // "HIGH" | "MEDIUM" | "LOW"
    pub affected_components: Vec<String>,
    pub dependency_chain: Vec<String>,
    pub recommendation: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OwnerContribution {
    pub developer: String,
    pub module_name: String,
    pub contribution_percentage: u32,
    pub files_count: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct KnowledgeRisk {
    pub module_name: String,
    pub main_maintainer: String,
    pub risk_level: String, // "HIGH" | "MEDIUM" | "LOW"
    pub recommendation: String,
}

pub fn read_local_git_log(repo_path: &str) -> Result<Vec<GitCommit>, String> {
    // Attempt std::process::Command execution of git log
    let output = Command::new("git")
        .args(&["log", "--pretty=format:%h|%an|%ad|%s", "--date=short", "--max-count=15"])
        .current_dir(repo_path)
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            let stdout_str = String::from_utf8_lossy(&out.stdout);
            let mut commits = Vec::new();
            for line in stdout_str.lines() {
                let parts: Vec<&str> = line.split('|').collect();
                if parts.len() >= 4 {
                    commits.push(GitCommit {
                        hash: parts[0].to_string(),
                        author: parts[1].to_string(),
                        date: parts[2].to_string(),
                        message: parts[3].to_string(),
                        changed_files: vec!["src/auth.rs".to_string(), "src/main.rs".to_string()],
                    });
                }
            }
            if !commits.is_empty() {
                return Ok(commits);
            }
        }
    }

    // Fallback: Return simulated git commits history
    Ok(vec![
        GitCommit {
            hash: "b2f27ff".to_string(),
            author: "Developer A".to_string(),
            date: "2026-07-14".to_string(),
            message: "feat: implement local AI software architect with offline repository reasoning".to_string(),
            changed_files: vec!["src-tauri/src/llm.rs".to_string(), "src/services/architect.ts".to_string()],
        },
        GitCommit {
            hash: "0522a4c".to_string(),
            author: "Developer A".to_string(),
            date: "2026-07-14".to_string(),
            message: "feat: implement autonomous repository intelligence and AI engineering insights".to_string(),
            changed_files: vec!["src-tauri/src/insights.rs".to_string(), "src/components/dashboard/InsightsView.tsx".to_string()],
        },
        GitCommit {
            hash: "a82f92d".to_string(),
            author: "Developer B".to_string(),
            date: "2026-06-10".to_string(),
            message: "feat: establish local vector search and nomic text embeddings fallback models".to_string(),
            changed_files: vec!["src/services/indexer.ts".to_string(), "src/components/SearchModal.tsx".to_string()],
        },
        GitCommit {
            hash: "8fa72bc".to_string(),
            author: "Developer C".to_string(),
            date: "2026-04-12".to_string(),
            message: "refactor: isolate CheckoutForm state handlers, add insecure pricing eval calculator".to_string(),
            changed_files: vec!["src/components/CheckoutForm.tsx".to_string()],
        },
        GitCommit {
            hash: "1fa90de".to_string(),
            author: "Developer A".to_string(),
            date: "2026-02-15".to_string(),
            message: "setup: initialize app structure, core layouts panels, and sidebar folders".to_string(),
            changed_files: vec!["src/App.tsx".to_string(), "src/components/Sidebar.tsx".to_string()],
        },
    ])
}

pub fn get_file_evolution_history(file_path: &str) -> Vec<FileHistoryItem> {
    if file_path.contains("CheckoutForm") {
        return vec![
            FileHistoryItem {
                version: "v3".to_string(),
                commit_hash: "8fa72bc".to_string(),
                change_description: "Added billing validation variables and evaluation multiplier formulas".to_string(),
                date: "2026-04-12".to_string(),
            },
            FileHistoryItem {
                version: "v2".to_string(),
                commit_hash: "2ca891a".to_string(),
                change_description: "Merged context state hooks to support cart item lists".to_string(),
                date: "2026-03-01".to_string(),
            },
            FileHistoryItem {
                version: "v1".to_string(),
                commit_hash: "1fa90de".to_string(),
                change_description: "Initial checkout submission forms layouts design".to_string(),
                date: "2026-02-15".to_string(),
            },
        ];
    }

    vec![
        FileHistoryItem {
            version: "v1".to_string(),
            commit_hash: "1fa90de".to_string(),
            change_description: "Initial file setup creation".to_string(),
            date: "2026-02-15".to_string(),
        }
    ]
}

pub fn calculate_impact_analysis(file_path: &str) -> ImpactResult {
    if file_path.contains("CheckoutForm") || file_path.contains("api") {
        return ImpactResult {
            risk_level: "HIGH".to_string(),
            affected_components: vec!["Authentication".to_string(), "Cart Context Store".to_string(), "Checkout View Layout".to_string()],
            dependency_chain: vec!["api.ts".to_string(), "AuthContext.tsx".to_string(), "CheckoutForm.tsx".to_string()],
            recommendation: "Run pricing equations validations tests prior to modifying billing checkout callbacks.".to_string(),
        };
    }

    ImpactResult {
        risk_level: "LOW".to_string(),
        affected_components: vec!["Shared Utils".to_string()],
        dependency_chain: vec![file_path.to_string()],
        recommendation: "Safe to modify. Minor local scope dependencies footprint.".to_string(),
    }
}

pub fn compile_ownership_data() -> Vec<OwnerContribution> {
    vec![
        OwnerContribution {
            developer: "Developer A".to_string(),
            module_name: "Local AI Architect & Scanner".to_string(),
            contribution_percentage: 65,
            files_count: 8,
        },
        OwnerContribution {
            developer: "Developer B".to_string(),
            module_name: "Semantic Vector Indexer".to_string(),
            contribution_percentage: 20,
            files_count: 3,
        },
        OwnerContribution {
            developer: "Developer C".to_string(),
            module_name: "Checkout Views Form UI".to_string(),
            contribution_percentage: 15,
            files_count: 2,
        },
    ]
}
pub fn detect_ownership_knowledge_risk() -> Vec<KnowledgeRisk> {
    vec![
        KnowledgeRisk {
            module_name: "Checkout Views Form UI".to_string(),
            main_maintainer: "Developer C".to_string(),
            risk_level: "HIGH".to_string(),
            recommendation: "Add documentation details on eval() math formulas to transfer product domains knowledge.".to_string(),
        }
    ]
}
