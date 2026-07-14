use std::path::{Path, PathBuf};
use std::collections::{HashMap, HashSet};
use std::fs;
use serde::{Serialize, Deserialize};
use walkdir::WalkDir;
use crate::parser::{parse_file_symbols, ParsedFileSymbols, ExtractedSymbol};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LanguageMetric {
    pub name: String,
    pub percentage: f64,
    pub color: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RepositoryStats {
    pub total_files: usize,
    pub total_folders: usize,
    pub total_lines_of_code: usize,
    pub total_functions: usize,
    pub total_classes: usize,
    pub total_interfaces: usize,
    pub total_structs: usize,
    pub total_traits: usize,
    pub total_dependencies: usize,
    pub largest_file: String,
    pub smallest_file: String,
    pub average_file_size: u64,
    pub language_distribution: Vec<LanguageMetric>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FrameworkDetails {
    pub name: String,
    pub confidence: f64,
    pub reason: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FolderExplanation {
    pub path: String,
    pub name: String,
    pub purpose: String,
    pub responsibilities: Vec<String>,
    pub dependencies: Vec<String>,
    pub important_files: Vec<String>,
    pub risk_level: String, // "low" | "medium" | "high"
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RepoMetadata {
    pub name: String,
    pub description: String,
    pub root_path: String,
    pub branch: String,
    pub commit_count: usize,
    pub file_count: usize,
    pub folders_count: usize,
    pub primary_language: String,
    pub architecture_style: String,
    pub frameworks: Vec<String>,
    pub package_manager: Option<String>,
    pub build_tool: Option<String>,
    pub entry_points: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DepNode {
    pub id: String,
    pub label: String,
    pub node_type: String, // "file" | "folder"
    pub size: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DepEdge {
    pub source: String,
    pub target: String,
    pub edge_type: String, // "import" | "call"
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DependencyGraph {
    pub nodes: Vec<DepNode>,
    pub edges: Vec<DepEdge>,
    pub circular_dependencies: Vec<Vec<String>>,
}

// Check if directory should be skipped
pub fn should_skip_dir(dir_name: &str) -> bool {
    let ignore_list = [
        "node_modules", ".git", "dist", "build", ".next", 
        "target", "coverage", "vendor", "bin", "obj", ".cache",
        "__pycache__", ".svelte-kit", ".nuxt", ".output", ".devlens"
    ];
    ignore_list.contains(&dir_name)
}

// Classify folder based on name
pub fn explain_folder(relative_path: &str, folder_name: &str) -> FolderExplanation {
    let name_lower = folder_name.to_lowercase();
    let (purpose, responsibilities, risk) = match name_lower.as_str() {
        "components" => (
            "Contains reusable UI component elements and layout styles.",
            vec!["Render UI elements".to_string(), "Manage visual widget states".to_string()],
            "low"
        ),
        "pages" | "views" | "screens" => (
            "Defines application viewport screens and primary page routes.",
            vec!["Organize component frames".to_string(), "Inject page-level routing bindings".to_string()],
            "low"
        ),
        "controllers" | "routes" | "api" => (
            "Bridges external HTTP endpoints and maps them to application business workflows.",
            vec!["Parse network payloads".to_string(), "Sanitize query parameters".to_string(), "Return HTTP JSON objects".to_string()],
            "medium"
        ),
        "services" | "managers" => (
            "Encapsulates complex core business workflow rules and calculations.",
            vec!["Compute price variables".to_string(), "Trigger payment gateways".to_string(), "Process logic flows".to_string()],
            "high"
        ),
        "repositories" | "models" | "db" | "database" | "migrations" => (
            "Coordinates persistent structures, query logic, and DB transactions.",
            vec!["Declare DB column bindings".to_string(), "Run raw SQL queries".to_string(), "Run transactional commits".to_string()],
            "high"
        ),
        "hooks" => (
            "Encapsulates state hooks to share logic between view rendering components.",
            vec!["Track scroll bounds".to_string(), "Manage asynchronous data fetch cache states".to_string()],
            "low"
        ),
        "utils" | "helpers" | "common" => (
            "Shared validation checks, date format helpers, and general utilities.",
            vec!["Clean input strings".to_string(), "Format date calendars".to_string()],
            "low"
        ),
        "middleware" | "guards" => (
            "Intercepts client network requests to check security tokens.",
            vec!["Verify JWT request headers".to_string(), "Limit connection thresholds".to_string()],
            "high"
        ),
        "tests" | "specs" | "__tests__" => (
            "Includes test suites verifying logic validity.",
            vec!["Assert API inputs correctness".to_string(), "Mock client request returns".to_string()],
            "low"
        ),
        "config" => (
            "Stores environment variables, port bindings, and connection endpoints.",
            vec!["Load env configurations".to_string(), "Define server ports".to_string()],
            "medium"
        ),
        _ => (
            "Provides general modules grouping project scripts and components.",
            vec!["Helper declarations".to_string()],
            "low"
        )
    };

    FolderExplanation {
        path: relative_path.to_string(),
        name: folder_name.to_string(),
        purpose: purpose.to_string(),
        responsibilities,
        dependencies: Vec::new(),
        important_files: Vec::new(),
        risk_level: risk.to_string(),
    }
}

// Detect language from file extension
pub fn get_file_language(file_path: &Path) -> Option<String> {
    let extension = file_path.extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_lowercase();
        
    match extension.as_str() {
        "ts" | "tsx" => Some("TypeScript".to_string()),
        "js" | "jsx" => Some("JavaScript".to_string()),
        "rs" => Some("Rust".to_string()),
        "py" => Some("Python".to_string()),
        "go" => Some("Go".to_string()),
        "java" => Some("Java".to_string()),
        "kt" | "kts" => Some("Kotlin".to_string()),
        "swift" => Some("Swift".to_string()),
        "php" => Some("PHP".to_string()),
        "c" => Some("C".to_string()),
        "cpp" | "h" | "hpp" => Some("C++".to_string()),
        "cs" => Some("C#".to_string()),
        "dart" => Some("Dart".to_string()),
        "toml" => Some("TOML".to_string()),
        "yaml" | "yml" => Some("YAML".to_string()),
        "json" => Some("JSON".to_string()),
        "sql" => Some("SQL".to_string()),
        _ => None,
    }
}

// Map languages to standard colors
pub fn get_language_color(lang: &str) -> String {
    match lang {
        "TypeScript" => "#3178c6".to_string(),
        "JavaScript" => "#f1e05a".to_string(),
        "Rust" => "#dea584".to_string(),
        "Python" => "#3572A5".to_string(),
        "Go" => "#00ADD8".to_string(),
        "Java" => "#b07219".to_string(),
        "Kotlin" => "#A97BFF".to_string(),
        "Swift" => "#F05138".to_string(),
        "PHP" => "#4F5D95".to_string(),
        "C" => "#555555".to_string(),
        "C++" => "#f34b7d".to_string(),
        "C#" => "#178600".to_string(),
        "Dart" => "#00B4AB".to_string(),
        "TOML" => "#9c9c9c".to_string(),
        "SQL" => "#e38c00".to_string(),
        _ => "#cccccc".to_string(),
    }
}

// DFS to find circular dependencies in adjacency map
pub fn find_circular_loops(graph: &HashMap<String, Vec<String>>) -> Vec<Vec<String>> {
    let mut circulars = Vec::new();
    let mut visited = HashSet::new();
    let mut stack = Vec::new();
    let mut in_stack = HashSet::new();

    fn dfs(
        node: &str, 
        graph: &HashMap<String, Vec<String>>,
        visited: &mut HashSet<String>,
        stack: &mut Vec<String>,
        in_stack: &mut HashSet<String>,
        circulars: &mut Vec<Vec<String>>
    ) {
        visited.insert(node.to_string());
        stack.push(node.to_string());
        in_stack.insert(node.to_string());

        if let Some(neighbors) = graph.get(node) {
            for neighbor in neighbors {
                if in_stack.contains(neighbor) {
                    // Loop detected! Trace back path
                    if let Some(pos) = stack.iter().position(|x| x == neighbor) {
                        let mut cycle = stack[pos..].to_vec();
                        cycle.push(neighbor.to_string());
                        circulars.push(cycle);
                    }
                } else if !visited.contains(neighbor) {
                    dfs(neighbor, graph, visited, stack, in_stack, circulars);
                }
            }
        }

        in_stack.remove(node);
        stack.pop();
    }

    for node in graph.keys() {
        if !visited.contains(node) {
            dfs(node, graph, &mut visited, &mut stack, &mut in_stack, &mut circulars);
        }
    }

    circulars
}

// Complete analysis engine coordinator
pub fn analyze_local_repository(root_path: &str) -> Result<(RepoMetadata, RepositoryStats, DependencyGraph), String> {
    let path = Path::new(root_path);
    if !path.exists() {
        return Err("Target repository path does not exist".to_string());
    }

    let repo_name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown-repository")
        .to_string();

    let mut total_files = 0;
    let mut total_folders = 0;
    let mut total_size = 0;
    let mut total_lines = 0;

    let mut file_extensions: HashMap<String, usize> = HashMap::new();
    let mut language_sizes: HashMap<String, u64> = HashMap::new();
    let mut files_list = Vec::new();
    
    // Scan directory
    let walk = WalkDir::new(path).into_iter();
    for entry in walk.filter_entry(|e| {
        let name = e.file_name().to_str().unwrap_or("");
        !should_skip_dir(name)
    }) {
        let entry = match entry {
            Ok(e) => e,
            Err(_) => continue,
        };
        
        let file_type = entry.file_type();
        if file_type.is_dir() {
            total_folders += 1;
        } else if file_type.is_file() {
            total_files += 1;
            let metadata = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };
            let size = metadata.len();
            total_size += size;

            let file_path = entry.path();
            if let Some(lang) = get_file_language(file_path) {
                *language_sizes.entry(lang.clone()).or_insert(0) += size;
                
                let ext = file_path.extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("")
                    .to_string();
                *file_extensions.entry(ext).or_insert(0) += 1;
                
                files_list.push(file_path.to_path_buf());
            }
        }
    }

    // Languages distribution
    let mut languages_metric = Vec::new();
    let total_lang_bytes: u64 = language_sizes.values().sum();
    let mut primary_language = "TypeScript".to_string();
    let mut max_bytes = 0;

    for (name, bytes) in &language_sizes {
        let percentage = if total_lang_bytes > 0 {
            (*bytes as f64 / total_lang_bytes as f64) * 100.0
        } else {
            0.0
        };
        if *bytes > max_bytes {
            max_bytes = *bytes;
            primary_language = name.clone();
        }
        languages_metric.push(LanguageMetric {
            color: get_language_color(name),
            name: name.clone(),
            percentage,
        });
    }
    languages_metric.sort_by(|a, b| b.percentage.partial_cmp(&a.percentage).unwrap());

    // AST Parse file modules
    let mut adjacency_map: HashMap<String, Vec<String>> = HashMap::new();
    let mut largest_file = String::new();
    let mut largest_size = 0;
    let mut smallest_file = String::new();
    let mut smallest_size = u64::MAX;
    
    let mut total_fns = 0;
    let mut total_classes = 0;
    let mut total_interfaces = 0;
    let mut total_structs = 0;
    let mut total_traits = 0;

    let mut graph_nodes = Vec::new();

    for file in &files_list {
        let file_size = fs::metadata(file).map(|m| m.len()).unwrap_or(0);
        let rel_path = file.strip_prefix(path)
            .ok()
            .and_then(|p| p.to_str())
            .unwrap_or("")
            .to_string();

        if file_size > largest_size {
            largest_size = file_size;
            largest_file = rel_path.clone();
        }
        if file_size < smallest_size && file_size > 0 {
            smallest_size = file_size;
            smallest_file = rel_path.clone();
        }

        if let Ok(content) = fs::read_to_string(file) {
            let parsed = parse_file_symbols(file, &content);
            total_lines += parsed.code_line_count;
            
            // Symbol counts
            for sym in &parsed.symbols {
                match sym.category.as_str() {
                    "function" => total_fns += 1,
                    "class" => total_classes += 1,
                    "interface" => total_interfaces += 1,
                    "struct" => total_structs += 1,
                    "trait" => total_traits += 1,
                    _ => {}
                }
            }

            // Map import coordinates
            let file_node_id = rel_path.clone();
            graph_nodes.push(DepNode {
                id: file_node_id.clone(),
                label: file.file_name().and_then(|n| n.to_str()).unwrap_or("").to_string(),
                node_type: "file".to_string(),
                size: (file_size / 50).max(15) as usize,
            });

            let mut resolved_imports = Vec::new();
            for imp in &parsed.imports {
                // If it's a relative import like ./api or ../context/AuthContext
                if imp.starts_with('.') {
                    let parent = file.parent().unwrap_or(path);
                    let mut resolved = parent.join(imp);
                    
                    // Try append extensions
                    let extensions = ["ts", "tsx", "js", "jsx", "rs", "py", "go"];
                    let mut found = false;
                    for ext in &extensions {
                        let candidate = resolved.with_extension(ext);
                        if candidate.exists() {
                            if let Ok(rel) = candidate.strip_prefix(path) {
                                if let Some(s) = rel.to_str() {
                                    resolved_imports.push(s.to_string());
                                    found = true;
                                    break;
                                }
                            }
                        }
                    }
                    if !found {
                        // Try index folder candidate
                        resolved.push("index.ts");
                        if resolved.exists() {
                            if let Ok(rel) = resolved.strip_prefix(path) {
                                if let Some(s) = rel.to_str() {
                                    resolved_imports.push(s.to_string());
                                }
                            }
                        }
                    }
                } else {
                    // Standard third party package imports
                    resolved_imports.push(imp.clone());
                }
            }
            adjacency_map.insert(file_node_id, resolved_imports);
        }
    }

    // Generate graph edges
    let mut graph_edges = Vec::new();
    for (src, targets) in &adjacency_map {
        for target in targets {
            // Only add edge if target is an internal file in our node list
            if adjacency_map.contains_key(target) {
                graph_edges.push(DepEdge {
                    source: src.clone(),
                    target: target.clone(),
                    edge_type: "import".to_string(),
                });
            }
        }
    }

    // Circular refs mapping
    let circular_dependencies = find_circular_loops(&adjacency_map);

    // Framework detection
    let mut frameworks = Vec::new();
    let mut package_manager = None;
    let mut build_tool = None;
    let mut arch_style = "Layered Architecture".to_string();

    let package_json_path = path.join("package.json");
    if package_json_path.exists() {
        package_manager = Some("npm".to_string());
        build_tool = Some("Vite".to_string());
        if let Ok(content) = fs::read_to_string(package_json_path) {
            if content.contains("\"react\"") {
                frameworks.push("React".to_string());
            }
            if content.contains("\"next\"") {
                frameworks.push("Next.js".to_string());
                arch_style = "Feature-Based (NextJS)".to_string();
            }
            if content.contains("\"@tauri-apps/api\"") {
                frameworks.push("Tauri Desktop Client".to_string());
            }
        }
    }

    let cargo_toml_path = path.join("Cargo.toml");
    if cargo_toml_path.exists() {
        package_manager = Some("cargo".to_string());
        build_tool = Some("Cargo".to_string());
        arch_style = "Clean / Hexagonal (Rust)".to_string();
        if let Ok(content) = fs::read_to_string(cargo_toml_path) {
            if content.contains("actix-web") {
                frameworks.push("Actix-Web API Server".to_string());
            }
            if content.contains("axum") {
                frameworks.push("Axum Web Server".to_string());
            }
        }
    }

    let req_txt_path = path.join("requirements.txt");
    if req_txt_path.exists() {
        package_manager = Some("pip".to_string());
        build_tool = Some("Pip".to_string());
        arch_style = "MVC Pattern (Python)".to_string();
        if let Ok(content) = fs::read_to_string(req_txt_path) {
            if content.contains("fastapi") {
                frameworks.push("FastAPI Microservice".to_string());
            }
            if content.contains("django") {
                frameworks.push("Django Web Framework".to_string());
            }
        }
    }

    // Determine Entry points
    let entry_points_candidates = [
        "src/main.tsx", "src/main.ts", "src/index.tsx", "src/index.ts", 
        "src/App.tsx", "main.py", "src/main.rs", "src/lib.rs", "main.go"
    ];
    let mut entry_points = Vec::new();
    for candidate in &entry_points_candidates {
        if path.join(candidate).exists() {
            entry_points.push(candidate.to_string());
        }
    }

    let metadata = RepoMetadata {
        name: repo_name,
        description: "DevLens analyzed codebase repository.".to_string(),
        root_path: root_path.to_string(),
        branch: "main".to_string(),
        commit_count: 124,
        file_count: total_files,
        folders_count: total_folders,
        primary_language,
        architecture_style: arch_style,
        frameworks,
        package_manager,
        build_tool,
        entry_points,
    };

    let average_file_size = if total_files > 0 {
        total_size / total_files as u64
    } else {
        0
    };

    let stats = RepositoryStats {
        total_files,
        total_folders,
        total_lines_of_code: total_lines,
        total_functions: total_fns,
        total_classes: total_classes,
        total_interfaces: total_interfaces,
        total_structs: total_structs,
        total_traits: total_traits,
        total_dependencies: graph_edges.len(),
        largest_file,
        smallest_file: if smallest_size == u64::MAX { "".to_string() } else { smallest_file },
        average_file_size,
        language_distribution: languages_metric,
    };

    let graph = DependencyGraph {
        nodes: graph_nodes,
        edges: graph_edges,
        circular_dependencies,
    };

    // Save cache locally inside .devlens/ folder
    let cache_dir = path.join(".devlens");
    let _ = fs::create_dir_all(&cache_dir);
    
    if let Ok(meta_json) = serde_json::to_string_pretty(&metadata) {
        let _ = fs::write(cache_dir.join("metadata.json"), meta_json);
    }
    if let Ok(stats_json) = serde_json::to_string_pretty(&stats) {
        let _ = fs::write(cache_dir.join("statistics.json"), stats_json);
    }
    if let Ok(graph_json) = serde_json::to_string_pretty(&graph) {
        let _ = fs::write(cache_dir.join("graph.json"), graph_json);
    }

    Ok((metadata, stats, graph))
}
