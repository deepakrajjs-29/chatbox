import { useState } from "react";
import { Repository } from "../types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { OverviewView } from "./dashboard/OverviewView";
import { ArchitectureView } from "./dashboard/ArchitectureView";
import { DependenciesView } from "./dashboard/DependenciesView";
import { ExplorerView } from "./dashboard/ExplorerView";
import { RoadmapView } from "./dashboard/RoadmapView";
import { HotspotsView } from "./dashboard/HotspotsView";
import { SecurityView } from "./dashboard/SecurityView";
import { ChatView } from "./dashboard/ChatView";
import { SettingsView } from "./dashboard/SettingsView";
import { InsightsView } from "./dashboard/InsightsView";
import { GitView } from "./dashboard/GitView";
import { CodeUniverseView } from "./dashboard/CodeUniverseView";
import { PerformanceView } from "./dashboard/PerformanceView";

interface DashboardProps {
  repo: Repository;
  onCloseRepo: () => void;
  onSearchTrigger: () => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export function Dashboard({ repo, onCloseRepo, onSearchTrigger, activeView: propsActiveView, onViewChange: propsOnViewChange }: DashboardProps) {
  const [localActiveView, setLocalActiveView] = useState("overview");
  const activeView = propsActiveView || localActiveView;
  const setActiveView = propsOnViewChange || setLocalActiveView;

  // Router matching content views
  const renderViewContent = () => {
    switch (activeView) {
      case "overview":
        return <OverviewView repo={repo} onViewChange={setActiveView} />;
      case "universe":
        return <CodeUniverseView repo={repo} />;
      case "insights":
        return <InsightsView repo={repo} />;
      case "git":
        return <GitView repo={repo} />;
      case "architecture":
        return <ArchitectureView repo={repo} />;
      case "dependencies":
        return <DependenciesView repo={repo} />;
      case "explorer":
        return <ExplorerView repo={repo} />;
      case "roadmap":
        return <RoadmapView repo={repo} />;
      case "hotspots":
        return <HotspotsView repo={repo} />;
      case "security":
        return <SecurityView repo={repo} />;
      case "chat":
        return <ChatView repo={repo} />;
      case "performance":
        return <PerformanceView repo={repo} />;
      case "settings":
        return <SettingsView repo={repo} />;
      default:
        return <OverviewView repo={repo} onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A] text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        repoName={repo.name} 
        repoPath={repo.path}
        onCloseRepo={onCloseRepo} 
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Header */}
        <Header 
          repoName={repo.name} 
          repoPath={repo.path} 
          branchName={repo.branch} 
          onSearchTrigger={onSearchTrigger}
        />

        {/* Dynamic View Scroll Panel */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto h-full">
            {renderViewContent()}
          </div>
        </main>

      </div>

    </div>
  );
}
