use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VisualizationNode {
    pub id: String,
    pub name: String,
    pub node_type: String, // "module" | "component" | "database" | "external" | "file"
    pub language: String,
    pub health: u32,       // 0-100 score
    pub complexity: u32,   // 0-100 score
    pub risk: String,       // "HIGH" | "MEDIUM" | "LOW"
    pub dependencies: Vec<String>,
    pub owner: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VisualizationEdge {
    pub source: String,
    pub target: String,
    pub relationship: String, // "import" | "call" | "reads" | "writes"
    pub weight: u32,
    pub risk: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExecutionStep {
    pub step_number: usize,
    pub name: String,
    pub file_path: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HeatmapFolder {
    pub path: String,
    pub size: usize,
    pub complexity: u32,
    pub bugs_count: usize,
    pub health_color: String, // "green" | "yellow" | "red"
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CodebaseUniverse {
    pub nodes: Vec<VisualizationNode>,
    pub edges: Vec<VisualizationEdge>,
    pub execution_flows: Vec<ExecutionStep>,
    pub health_heatmap: Vec<HeatmapFolder>,
}

pub fn compile_codebase_universe_offline(repo_path: &str) -> CodebaseUniverse {
    let _repo_name = repo_path.split(/[/\\]/).pop().unwrap_or("repository");

    let nodes = vec![
        VisualizationNode {
            id: "api_service".to_string(),
            name: "api.ts".to_string(),
            node_type: "external".to_string(),
            language: "TypeScript".to_string(),
            health: 76,
            complexity: 30,
            risk: "HIGH".to_string(),
            dependencies: vec!["AuthContext".to_string()],
            owner: "Developer B".to_string(),
        },
        VisualizationNode {
            id: "auth_context".to_string(),
            name: "AuthContext.tsx".to_string(),
            node_type: "module".to_string(),
            language: "TypeScript".to_string(),
            health: 90,
            complexity: 45,
            risk: "LOW".to_string(),
            dependencies: vec![],
            owner: "Developer A".to_string(),
        },
        VisualizationNode {
            id: "checkout_form".to_string(),
            name: "CheckoutForm.tsx".to_string(),
            node_type: "component".to_string(),
            language: "TypeScript".to_string(),
            health: 62,
            complexity: 78,
            risk: "HIGH".to_string(),
            dependencies: vec!["CartContext".to_string(), "api_service".to_string()],
            owner: "Developer C".to_string(),
        },
        VisualizationNode {
            id: "cart_context".to_string(),
            name: "CartContext.tsx".to_string(),
            node_type: "module".to_string(),
            language: "TypeScript".to_string(),
            health: 80,
            complexity: 65,
            risk: "MEDIUM".to_string(),
            dependencies: vec!["AuthContext".to_string()],
            owner: "Developer A".to_string(),
        },
    ];

    let edges = vec![
        VisualizationEdge {
            source: "checkout_form".to_string(),
            target: "cart_context".to_string(),
            relationship: "call".to_string(),
            weight: 5,
            risk: "MEDIUM".to_string(),
        },
        VisualizationEdge {
            source: "checkout_form".to_string(),
            target: "api_service".to_string(),
            relationship: "import".to_string(),
            weight: 8,
            risk: "HIGH".to_string(),
        },
        VisualizationEdge {
            source: "cart_context".to_string(),
            target: "auth_context".to_string(),
            relationship: "import".to_string(),
            weight: 3,
            risk: "LOW".to_string(),
        },
    ];

    let execution_flows = vec![
        ExecutionStep {
            step_number: 1,
            name: "Button Click Submit".to_string(),
            file_path: "CheckoutForm.tsx".to_string(),
            description: "User clicks the pay button, triggering onSubmit wrapper.".to_string(),
        },
        ExecutionStep {
            step_number: 2,
            name: "Pricing Calculation".to_string(),
            file_path: "CheckoutForm.tsx".to_string(),
            description: "Calculates total cost using dynamic eval multipliers.".to_string(),
        },
        ExecutionStep {
            step_number: 3,
            name: "API Request dispatch".to_string(),
            file_path: "api.ts".to_string(),
            description: "Sends JSON payload containing total and auth headers to payments gateway.".to_string(),
        },
        ExecutionStep {
            step_number: 4,
            name: "Cart Cache Clear".to_string(),
            file_path: "CartContext.tsx".to_string(),
            description: "Triggers clearCart() state resets upon receiving successful HTTP response.".to_string(),
        },
    ];

    let health_heatmap = vec![
        HeatmapFolder {
            path: "src/components".to_string(),
            size: 45000,
            complexity: 68,
            bugs_count: 3,
            health_color: "yellow".to_string(),
        },
        HeatmapFolder {
            path: "src/context".to_string(),
            size: 28000,
            complexity: 55,
            bugs_count: 1,
            health_color: "green".to_string(),
        },
        HeatmapFolder {
            path: "src/services".to_string(),
            size: 15400,
            complexity: 72,
            bugs_count: 2,
            health_color: "red".to_string(),
        },
        HeatmapFolder {
            path: "src/utils".to_string(),
            size: 8900,
            complexity: 25,
            bugs_count: 0,
            health_color: "green".to_string(),
        },
    ];

    CodebaseUniverse {
        nodes,
        edges,
        execution_flows,
        health_heatmap,
    }
}
