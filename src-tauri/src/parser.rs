use serde::{Serialize, Deserialize};
use std::path::Path;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ExtractedSymbol {
    pub name: String,
    pub line_number: usize,
    pub category: String, // "class" | "function" | "struct" | "trait" | "interface" | "method"
    pub complexity: String, // "low" | "medium" | "high"
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ParsedFileSymbols {
    pub imports: Vec<String>,
    pub exports: Vec<String>,
    pub symbols: Vec<ExtractedSymbol>,
    pub code_line_count: usize,
}

pub fn parse_file_symbols(file_path: &Path, content: &str) -> ParsedFileSymbols {
    let mut imports = Vec::new();
    let mut exports = Vec::new();
    let mut symbols = Vec::new();
    
    let extension = file_path.extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_lowercase();
        
    let lines: Vec<&str> = content.lines().collect();
    let code_line_count = lines.len();

    for (idx, line) in lines.iter().enumerate() {
        let line_num = idx + 1;
        let trimmed = line.trim();

        // Skip blank/pure comments in general checks
        if trimmed.is_empty() {
            continue;
        }

        match extension.as_str() {
            "ts" | "tsx" | "js" | "jsx" => {
                // Parse imports e.g., import { x } from "y" or require("y")
                if (trimmed.starts_with("import ") || trimmed.starts_with("import{")) && trimmed.contains("from") {
                    if let Some(pos) = trimmed.find("from") {
                        let module_part = trimmed[pos + 4..].trim().trim_matches(|c| c == '\'' || c == '"' || c == ';');
                        imports.push(module_part.to_string());
                    }
                } else if trimmed.contains("require(") {
                    if let Some(start) = trimmed.find("require(") {
                        let inner = &trimmed[start + 8..];
                        if let Some(end) = inner.find(')') {
                            let module_part = inner[..end].trim().trim_matches(|c| c == '\'' || c == '"');
                            imports.push(module_part.to_string());
                        }
                    }
                }

                // Parse exports
                if trimmed.starts_with("export ") {
                    if trimmed.contains("function ") {
                        if let Some(name) = extract_js_symbol_name(trimmed, "function ") {
                            exports.push(name.clone());
                            symbols.push(ExtractedSymbol {
                                name,
                                line_number: line_num,
                                category: "function".to_string(),
                                complexity: evaluate_complexity(line),
                            });
                        }
                    } else if trimmed.contains("class ") {
                        if let Some(name) = extract_js_symbol_name(trimmed, "class ") {
                            exports.push(name.clone());
                            symbols.push(ExtractedSymbol {
                                name,
                                line_number: line_num,
                                category: "class".to_string(),
                                complexity: "medium".to_string(),
                            });
                        }
                    }
                } else {
                    // Internal symbols
                    if trimmed.starts_with("function ") {
                        if let Some(name) = extract_js_symbol_name(trimmed, "function ") {
                            symbols.push(ExtractedSymbol {
                                name,
                                line_number: line_num,
                                category: "function".to_string(),
                                complexity: evaluate_complexity(line),
                            });
                        }
                    } else if trimmed.starts_with("class ") {
                        if let Some(name) = extract_js_symbol_name(trimmed, "class ") {
                            symbols.push(ExtractedSymbol {
                                name,
                                line_number: line_num,
                                category: "class".to_string(),
                                complexity: "medium".to_string(),
                            });
                        }
                    } else if trimmed.starts_with("interface ") {
                        if let Some(name) = extract_js_symbol_name(trimmed, "interface ") {
                            symbols.push(ExtractedSymbol {
                                name,
                                line_number: line_num,
                                category: "interface".to_string(),
                                complexity: "low".to_string(),
                            });
                        }
                    }
                }
            }
            "rs" => {
                // Parse Rust imports e.g., use a::b::c;
                if trimmed.starts_with("use ") {
                    let import_path = trimmed[4..].trim().trim_matches(';');
                    imports.push(import_path.to_string());
                } else if trimmed.starts_with("pub use ") {
                    let import_path = trimmed[8..].trim().trim_matches(';');
                    imports.push(import_path.to_string());
                }

                // Parse Rust symbols: struct, enum, fn, trait, impl
                if trimmed.contains("fn ") {
                    if let Some(name) = extract_rust_symbol_name(trimmed, "fn ") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "function".to_string(),
                            complexity: evaluate_complexity(line),
                        });
                    }
                } else if trimmed.contains("struct ") {
                    if let Some(name) = extract_rust_symbol_name(trimmed, "struct ") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "struct".to_string(),
                            complexity: "low".to_string(),
                        });
                    }
                } else if trimmed.contains("trait ") {
                    if let Some(name) = extract_rust_symbol_name(trimmed, "trait ") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "trait".to_string(),
                            complexity: "low".to_string(),
                        });
                    }
                } else if trimmed.contains("enum ") {
                    if let Some(name) = extract_rust_symbol_name(trimmed, "enum ") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "enum".to_string(),
                            complexity: "low".to_string(),
                        });
                    }
                }
            }
            "py" => {
                // Parse Python imports e.g., import x, from x import y
                if trimmed.starts_with("import ") {
                    let parts: Vec<&str> = trimmed[7..].split(',').collect();
                    for p in parts {
                        imports.push(p.trim().to_string());
                    }
                } else if trimmed.starts_with("from ") {
                    if let Some(pos) = trimmed.find(" import ") {
                        let module_part = trimmed[5..pos].trim();
                        imports.push(module_part.to_string());
                    }
                }

                // Parse classes and defs
                if trimmed.starts_with("def ") {
                    if let Some(name) = extract_python_symbol_name(trimmed, "def ") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "function".to_string(),
                            complexity: evaluate_complexity(line),
                        });
                    }
                } else if trimmed.starts_with("class ") {
                    if let Some(name) = extract_python_symbol_name(trimmed, "class ") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "class".to_string(),
                            complexity: "medium".to_string(),
                        });
                    }
                }
            }
            "go" => {
                // Parse Go imports
                if trimmed.starts_with("import ") {
                    if trimmed.contains('"') {
                        let import_part = trimmed.trim_matches(|c| c == 'i' || c == 'm' || c == 'p' || c == 'o' || c == 'r' || c == 't' || c == ' ' || c == '"');
                        imports.push(import_part.to_string());
                    }
                }

                // Parse Go func, struct, interface
                if trimmed.starts_with("func ") {
                    if let Some(name) = extract_go_symbol_name(trimmed, "func ") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "function".to_string(),
                            complexity: evaluate_complexity(line),
                        });
                    }
                } else if trimmed.contains(" struct ") {
                    if let Some(name) = extract_go_struct_interface(trimmed, "struct") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "struct".to_string(),
                            complexity: "low".to_string(),
                        });
                    }
                } else if trimmed.contains(" interface ") {
                    if let Some(name) = extract_go_struct_interface(trimmed, "interface") {
                        symbols.push(ExtractedSymbol {
                            name,
                            line_number: line_num,
                            category: "interface".to_string(),
                            complexity: "low".to_string(),
                        });
                    }
                }
            }
            _ => {}
        }
    }

    ParsedFileSymbols {
        imports,
        exports,
        symbols,
        code_line_count,
    }
}

// Helpers for symbol extraction
fn extract_js_symbol_name(line: &str, prefix: &str) -> Option<String> {
    if let Some(pos) = line.find(prefix) {
        let after = &line[pos + prefix.len()..];
        let name_part = after.split(|c| c == '(' || c == ' ' || c == '{' || c == '<' || c == ':').next()?;
        if !name_part.trim().is_empty() {
            return Some(name_part.trim().to_string());
        }
    }
    None
}

fn extract_rust_symbol_name(line: &str, prefix: &str) -> Option<String> {
    if let Some(pos) = line.find(prefix) {
        let after = &line[pos + prefix.len()..];
        let name_part = after.split(|c| c == '(' || c == ' ' || c == '<' || c == '{' || c == ';').next()?;
        if !name_part.trim().is_empty() {
            return Some(name_part.trim().to_string());
        }
    }
    None
}

fn extract_python_symbol_name(line: &str, prefix: &str) -> Option<String> {
    if let Some(pos) = line.find(prefix) {
        let after = &line[pos + prefix.len()..];
        let name_part = after.split(|c| c == '(' || c == ' ' || c == ':').next()?;
        if !name_part.trim().is_empty() {
            return Some(name_part.trim().to_string());
        }
    }
    None
}

fn extract_go_symbol_name(line: &str, prefix: &str) -> Option<String> {
    if let Some(pos) = line.find(prefix) {
        let after = &line[pos + prefix.len()..];
        // Handle receiver: func (r *Receiver) MethodName()
        let name_part = if after.starts_with('(') {
            if let Some(close_paren) = after.find(')') {
                let method_after = &after[close_paren + 1..].trim();
                method_after.split(|c| c == '(' || c == ' ' || c == '{').next()?
            } else {
                after.split(|c| c == '(' || c == ' ' || c == '{').next()?
            }
        } else {
            after.split(|c| c == '(' || c == ' ' || c == '{').next()?
        };
        if !name_part.trim().is_empty() {
            return Some(name_part.trim().to_string());
        }
    }
    None
}

fn extract_go_struct_interface(line: &str, keyword: &str) -> Option<String> {
    let parts: Vec<&str> = line.split("type").collect();
    if parts.len() > 1 {
        let after_type = parts[1].trim();
        if let Some(kw_pos) = after_type.find(keyword) {
            let name = after_type[..kw_pos].trim();
            if !name.is_empty() {
                return Some(name.to_string());
            }
        }
    }
    None
}

fn evaluate_complexity(line: &str) -> String {
    // If the signature includes lots of parameters or complex generic bounds, classify as medium/high
    let param_count = line.chars().filter(|&c| c == ',').count();
    if param_count > 4 {
        "high".to_string()
    } else if param_count > 2 {
        "medium".to_string()
    } else {
        "low".to_string()
    }
}
