import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Terminal, Database, ShieldAlert, Code } from "lucide-react";

interface LoaderProps {
  repoName: string;
  onComplete: () => void;
}

const LOG_MESSAGES = [
  { text: "Initializing repository scanner...", icon: Terminal, delay: 0 },
  { text: "Scanning folder tree (ignoring binaries, node_modules, dist)...", icon: Terminal, delay: 200 },
  { text: "Detected project languages and framework patterns...", icon: Code, delay: 500 },
  { text: "Parsing AST structures for 42 TypeScript modules...", icon: Code, delay: 900 },
  { text: "Extracting import definitions and function parameters...", icon: Code, delay: 1300 },
  { text: "Building local circular dependency import graph...", icon: Database, delay: 1800 },
  { text: "Executing local embedder model (nomic-embed-text)...", icon: Database, delay: 2400 },
  { text: "Writing 184 chunk vector coordinates to local LanceDB database...", icon: Database, delay: 3000 },
  { text: "Analyzing file complexity and risk levels...", icon: ShieldAlert, delay: 3500 },
  { text: "Scanning code layers for hardcoded security credentials...", icon: ShieldAlert, delay: 4000 },
  { text: "Structuring local SQLite schema tables...", icon: Database, delay: 4400 },
  { text: "Indexing completed. Spawning DevLens dashboard...", icon: Terminal, delay: 4800 }
];

export function Loader({ repoName, onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // 1. Progress bar timer
    const duration = 5000; // 5 seconds
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(nextProgress);
      
      if (nextProgress >= 100) {
        clearInterval(progressInterval);
        
        // Confetti explosion
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#4F8CFF", "#8B5CF6", "#10B981"]
        });
        
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }, intervalTime);

    // 2. Logging messages simulation
    LOG_MESSAGES.forEach((item) => {
      const timeout = setTimeout(() => {
        setLogs((prev) => [...prev, item.text]);
      }, item.delay);
      return () => clearTimeout(timeout);
    });

    return () => {
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A] px-4">
      {/* Background Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px] animate-pulse-slow"></div>
      
      <div className="relative z-10 w-full max-w-xl text-center">
        {/* Pulsing Scanner Rings */}
        <div className="relative mx-auto mb-10 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
          <div className="absolute h-16 w-16 rounded-full border-2 border-accent/40 animate-pulse"></div>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Code className="h-5 w-5" />
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
          Indexing <span className="text-primary">{repoName}</span>
        </h2>
        <p className="mb-6 text-sm text-gray-400">
          DevLens AI is scanning files and generating local vector embeddings...
        </p>

        {/* Custom Progress Bar */}
        <div className="relative mb-8 h-2 w-full overflow-hidden rounded-full bg-neutral-900 border border-neutral-800">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Progress Percentage */}
        <div className="flex justify-between text-xs text-gray-500 mb-6 px-1">
          <span>RAG Pipeline</span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>

        {/* Real-time scanning terminal log panel */}
        <div className="h-44 w-full overflow-y-auto rounded-xl border border-white/5 bg-black/60 p-4 text-left font-mono text-xs text-gray-400 shadow-inner">
          <div className="space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 animate-slide-up">
                <span className="text-primary/70 shrink-0">❯</span>
                <span className="text-gray-300">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
