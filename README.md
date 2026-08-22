# DevLens AI

<div align="center">

![DevLens AI Banner](https://raw.githubusercontent.com/deepakrajjs-29/DevLens-AI/main/public/banner.png)

### **"Understand Any Codebase. Entirely On Your Machine."**

[![Tauri v2](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri&logoColor=white)](https://tauri.app/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-Stable-black?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Local AI](https://img.shields.io/badge/Local_AI-Ollama_%2F_Qwen2.5-purple?logo=ollama&logoColor=white)](https://ollama.ai/)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25_On--Device-success)](https://github.com/deepakrajjs-29/DevLens-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Software Innovation Challenge II Competition Entry**

[Key Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Competition Report](./COMPETITION_REPORT.md) • [Documentation](./DOCUMENTATION.md)

</div>

---

## 🌟 What is DevLens AI?

**DevLens AI** is a production-grade, privacy-first, 100% local repository intelligence desktop application. It transforms complex software repositories into interactive visual graphs, semantic search indexes, and AI-conversational workspaces — **with zero source code leaving your device**.

### The Core Problem It Solves
When developers join a new team, onboard into an unfamiliar codebase, or audit legacy software, understanding hundreds of files and hidden dependencies takes days or weeks. Sending proprietary code to cloud AI services introduces major security and intellectual property risks. 

**DevLens AI eliminates this trade-off**: everything from AST parsing, vector embeddings (384-dim polynomial hashing), security scanning, dependency cycle detection, to local LLM chat runs on your local workstation.

---

## 🚀 Key Features

| Capability | Description |
|---|---|
| 🌌 **Code Universe 2.0** | Interactive force-directed topology graph built with `@xyflow/react`. Features risk-based node color coding (Red = High Risk, Amber = Medium, Green = Healthy), animated edges for critical connections, real-time node filtering, and a deep node inspection side-panel. |
| 🔍 **Local Semantic Search** | ⌘K command palette with hybrid lexical-vector search. Finds code by describing what it does rather than exact keyword names. |
| 💬 **Offline RAG Chat 2.0** | Conversational AI architect with real-time token streaming, rich Markdown rendering (bold, tables, syntax-highlighted code blocks), Ollama connectivity status detection, and clickable source file citation chips. |
| 🛡️ **Security Intelligence 2.0** | Unified Static Application Security Testing (SAST) dashboard with `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO` severity breakdowns, masked credentials previews, and actionable remediation recommendations. |
| ❤️ **Codebase Health Score Ring** | Quantified 0–100 codebase health score computed across 6 dimensions (Code Quality, Maintainability, Security, Performance, Test Coverage, Documentation) with animated SVG indicators. |
| 📄 **One-Click Codebase Report Generator** | Instant comprehensive Markdown engineering report generation detailing executive summaries, health metrics, security findings, and AI refactoring roadmaps with one-click copy and `.md` file download. |
| 🌿 **Git Intelligence & Bus-Factor** | Historical commit velocity, file churn analysis, contributor ownership distributions, and knowledge-silo risk identification. |
| 🕸️ **Dependency Graph & Circular Detector** | Interactive import dependency graphs with automated DFS-based circular dependency loop detection. |
| 🗺️ **Learning Roadmap** | AI-curated step-by-step onboarding sequences guiding developers through core domain modules. |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      DEVELOPER'S MACHINE                          │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    DEVLENS AI APPLICATION                    │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │              REACT + TYPESCRIPT FRONTEND             │    │  │
│  │  │  Overview · Code Universe · AI Chat · Security      │    │  │
│  │  │  Git · Dependencies · Explorer · Reports · Insights  │    │  │
│  │  │  @xyflow/react · Framer Motion · Lucide Icons        │    │  │
│  │  └──────────────────┬──────────────────────────────────┘    │  │
│  │                     │ Tauri v2 IPC Bridge                   │  │
│  │  ┌──────────────────▼──────────────────────────────────┐    │  │
│  │  │              RUST BACKEND (Tauri v2)               │    │  │
│  │  │                                                     │    │  │
│  │  │  analyzer.rs     → AST parsing & complexity scoring │    │  │
│  │  │  git_analyzer.rs → Commit velocity & author risk    │    │  │
│  │  │  insights.rs     → Health score & SAST aggregation  │    │  │
│  │  │  universe.rs     → Graph topology & DFS cycles      │    │  │
│  │  │  indexer.ts      → 384-dim polynomial hash vectors  │    │  │
│  │  └──────────────────┬──────────────────────────────────┘    │  │
│  │                     │ Localhost HTTP                        │  │
│  │  ┌──────────────────▼──────────────────────────────────┐    │  │
│  │  │      OLLAMA LOCAL LLM ENGINE (Optional)             │    │  │
│  │  │      Model: Qwen2.5-Coder 3B (http://localhost:11434)│   │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              LOCAL REPOSITORY (User's Code)                  │  │
│  │  /path/to/project ← Never transmitted over the network      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Privacy & Security Guarantee

1. **Zero Cloud Exfiltration**: No telemetry, no analytics beacons, and no external AI API calls.
2. **Local Vector Embeddings**: Embeddings are computed and stored directly on your machine.
3. **Local LLM Execution**: Runs via Ollama on localhost (`11434`). If Ollama is offline, DevLens AI seamlessly falls back to its built-in heuristic reasoning engine.

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust & Cargo](https://rustup.rs/) (stable toolchain)
- [Ollama](https://ollama.ai/) *(Optional, for local AI chat)*

### 1. Clone & Install
```bash
git clone https://github.com/deepakrajjs-29/DevLens-AI.git
cd DevLens-AI
npm install
```

### 2. Run Web Development Server (Preview Mode)
```bash
npm run dev
```
Open [http://localhost:1420](http://localhost:1420) in your browser.

### 3. Run Desktop Application (Full Tauri Mode)
```bash
npm run tauri dev
```

### 4. Setup Local AI Model (Optional)
```bash
# Pull and start recommended local model
ollama run qwen2.5-coder:3b
```

---

## 📊 Comprehensive Competition Resources

For judges and evaluators of the **Software Innovation Challenge II**:
- 📑 **[Complete Competition Project Report (39 Sections)](./COMPETITION_REPORT.md)**: Full architecture breakdown, 25 judge Q&As, 3-minute demo script, 15-slide PPT blueprint, and evaluation criteria mapping.
- 📖 **[System Documentation](./DOCUMENTATION.md)**: Technical specifications, data models, IPC command references, and performance considerations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS v4, Framer Motion |
| **Visualizations** | `@xyflow/react` (React Flow v12), HTML5 Canvas, SVG |
| **Desktop Runtime** | Tauri v2 (Rust Core) |
| **Backend & Parsers**| Rust, Regex/AST Heuristics, System Git CLI |
| **Local Embeddings** | 384-Dimensional Polynomial Hashing Vector Pipeline |
| **Local LLM Engine** | Ollama (`qwen2.5-coder:3b`), Streaming API |
| **Icons & Bundler**  | Lucide React, Vite 7 |

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
