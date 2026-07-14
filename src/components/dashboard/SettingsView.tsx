import { useState, useEffect } from "react";
import { Repository, AppSettings } from "../../types";
import { Cpu, Database, Save, Check, FileDown, EyeOff } from "lucide-react";

interface SettingsViewProps {
  repo: Repository;
}

export function SettingsView({ repo }: SettingsViewProps) {
  const [settings, setSettings] = useState<AppSettings>({
    localModel: "Qwen2.5-Coder 3B Instruct",
    embeddingModel: "nomic-embed-text",
    theme: "dark",
    maxMemoryGb: 8,
    threadCount: 4
  });
  
  const [ignoredFolders, setIgnoredFolders] = useState<string>("node_modules, .git, dist, build, .devlens");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("devlens_settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        // use default
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("devlens_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = (reportType: "health" | "security" | "roadmap") => {
    let filename = "";
    let content = "";

    if (reportType === "health") {
      filename = `${repo.name}_health_report.md`;
      content = `# DevLens AI Repository Health Report — ${repo.name}\n\n` +
        `Generated: ${new Date().toISOString().split('T')[0]}\n` +
        `Workspace Directory: ${repo.path}\n\n` +
        `## Executive Summary\n` +
        `- Architecture Score: 92%\n` +
        `- Security Scanner Score: 76%\n` +
        `- Documentation Score: 54%\n` +
        `- Maintainability Rating: 80%\n\n` +
        `## Category Analysis\n` +
        `1. **Architecture coupling**: Moderate coupling inside CheckoutForm.tsx. Views are cleanly split otherwise.\n` +
        `2. **Security vulnerabilities audit**: Hardcoded secrets found on api.ts.\n` +
        `3. **Unit Test Scopes**: 63% Coverage. Missing mock specs for payment post pipelines.\n`;
    } else if (reportType === "security") {
      filename = `${repo.name}_security_audit.md`;
      content = `# DevLens AI Static Application Security Testing (SAST) — ${repo.name}\n\n` +
        `## Audit Results Summary\n` +
        `- High Severity: 1 Warning\n` +
        `- Medium Severity: 1 Warning\n` +
        `- Low Severity: 0 Warnings\n\n` +
        `## Findings Log\n\n` +
        `### Finding #1: Hardcoded Credential Secrets (HIGH)\n` +
        `- **File Path**: src/services/api.ts\n` +
        `- **Code Line**: 2\n` +
        `- **Description**: Leak of private API credential token variable (sk_live).\n` +
        `- **Recommendation**: Move private API secret parameters to secure local environment variables (.env.local).\n\n` +
        `### Finding #2: Dangerous Code Execution (MEDIUM)\n` +
        `- **File Path**: src/components/CheckoutForm.tsx\n` +
        `- **Code Line**: 18\n` +
        `- **Description**: Execution of dynamic math via eval().\n` +
        `- **Recommendation**: Refactor float multipliers calculation parsing to prevent code injection.\n`;
    } else {
      filename = `${repo.name}_refactoring_roadmap.md`;
      content = `# DevLens AI Refactoring Roadmap & Action Steps — ${repo.name}\n\n` +
        `## Action Checklist\n\n` +
        `- [ ] **Step 1: Secure API key configuration (Priority: HIGH)**\n` +
        `  Migrate api.ts sk_live declarations to environment files.\n` +
        `- [ ] **Step 2: Remove CheckoutForm eval execution (Priority: HIGH)**\n` +
        `  Refactor inline calculator statements to use standard math routines.\n` +
        `- [ ] **Step 3: CartContext Documentation check (Priority: MEDIUM)**\n` +
        `  Add comments detail summaries inside the hooks files.\n` +
        `- [ ] **Step 4: Create CheckoutForm Mock tests (Priority: LOW)**\n` +
        `  Expand unit coverage files mapping inputs checks.\n`;
    }

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-gray-400 mt-1">
          Adjust local LLM model targets, vector embedders, and CPU workloads for <span className="font-semibold text-primary">{repo.name}</span>.
        </p>
      </div>

      <div className="max-w-2xl space-y-6 pb-12">
        {/* Model Configurations */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-primary" />
            Local AI Engine
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Ollama LLM Model</label>
              <select
                value={settings.localModel}
                onChange={(e) => setSettings({ ...settings, localModel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-white/5 bg-black/60 text-white focus:outline-none focus:border-primary text-xs"
              >
                <option>Qwen2.5-Coder 3B Instruct (Recommended)</option>
                <option>Phi-3 Mini</option>
                <option>SmolLM2</option>
                <option>DeepSeek Coder 1.5B</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Embedding Vector Model</label>
              <select
                value={settings.embeddingModel}
                onChange={(e) => setSettings({ ...settings, embeddingModel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-white/5 bg-black/60 text-white focus:outline-none focus:border-primary text-xs"
              >
                <option>nomic-embed-text (Recommended)</option>
                <option>all-minilm-l6-v2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ignored Folders */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <EyeOff className="h-4.5 w-4.5 text-primary" />
            Ignored Folders & Files
          </h3>
          <div className="space-y-1.5">
            <label className="font-bold text-gray-400">Excluded Glob Paths</label>
            <input
              type="text"
              value={ignoredFolders}
              onChange={(e) => setIgnoredFolders(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/5 bg-black/60 text-white focus:outline-none focus:border-primary text-xs font-mono"
            />
            <p className="text-[10px] text-gray-500 font-medium">Excluded paths are skipped during local vector embedding parses.</p>
          </div>
        </div>

        {/* Performance Workloads */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-accent" />
            Performance & Resources
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">CPU Threads Limit</label>
              <input
                type="number"
                min="1"
                max="32"
                value={settings.threadCount}
                onChange={(e) => setSettings({ ...settings, threadCount: parseInt(e.target.value) || 4 })}
                className="w-full px-3 py-2 rounded-xl border border-white/5 bg-black/60 text-white focus:outline-none focus:border-primary text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-400">Max System Memory allocation (GB)</label>
              <input
                type="number"
                min="2"
                max="128"
                value={settings.maxMemoryGb}
                onChange={(e) => setSettings({ ...settings, maxMemoryGb: parseInt(e.target.value) || 8 })}
                className="w-full px-3 py-2 rounded-xl border border-white/5 bg-black/60 text-white focus:outline-none focus:border-primary text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Report Exporter */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileDown className="h-4.5 w-4.5 text-success" />
            Export Codebase Reports
          </h3>
          <p className="text-[10px] text-gray-400">Download formatted Markdown snapshots of code insights directly to your download folder.</p>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={() => handleExport("health")}
              className="px-3.5 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-gray-300 transition-colors flex items-center gap-1.5"
            >
              <FileDown className="h-3.5 w-3.5 text-primary" />
              Health Report
            </button>
            <button 
              onClick={() => handleExport("security")}
              className="px-3.5 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-gray-300 transition-colors flex items-center gap-1.5"
            >
              <FileDown className="h-3.5 w-3.5 text-danger" />
              Security SAST
            </button>
            <button 
              onClick={() => handleExport("roadmap")}
              className="px-3.5 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-gray-300 transition-colors flex items-center gap-1.5"
            >
              <FileDown className="h-3.5 w-3.5 text-success" />
              Refactor Roadmap
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4 text-white" />
                <span>Settings Saved</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Configurations</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
