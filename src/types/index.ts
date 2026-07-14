export interface Repository {
  path: string;
  name: string;
  branch: string;
  commitCount: number;
  fileCount: number;
  foldersCount: number;
  sizeBytes: number;
  languages: { name: string; percentage: number; color: string }[];
  frameworks: string[];
  packageManager?: string;
  architectureStyle?: string;
  buildTool?: string;
}

export interface RecentRepo {
  path: string;
  name: string;
  lastOpened: string;
  sizeBytes?: number;
  language?: string;
}

export interface RepoFile {
  path: string;
  name: string;
  sizeBytes: number;
  extension: string;
  codeLineCount: number;
  complexityScore: number; // 1-100 scale
  summary: string;
  purpose: string;
  functions: { name: string; line: number; complexity: 'low' | 'medium' | 'high' }[];
  classes: string[];
  dependencies: string[];
  issues: { type: 'warning' | 'error' | 'info'; message: string; line?: number }[];
}

export interface RepoFolder {
  path: string;
  name: string;
  purpose: string;
  responsibilities: string[];
  dependencies: string[];
  importantFiles: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DependencyNode {
  id: string;
  label: string;
  type: 'file' | 'folder';
  size: number;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'import' | 'call';
}

export interface BugHotspot {
  filePath: string;
  score: number; // 0-100 risk score
  reasons: string[];
  linesOfCode: number;
  complexity: number;
}

export interface SecurityVulnerability {
  filePath: string;
  line: number;
  severity: 'low' | 'medium' | 'high';
  type: string;
  message: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'current' | 'done';
  files: string[];
  explanations: string[];
}

export interface AppSettings {
  localModel: string;
  embeddingModel: string;
  theme: 'dark' | 'light';
  maxMemoryGb: number;
  threadCount: number;
}

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
