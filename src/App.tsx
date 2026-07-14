import { useState, useEffect } from "react";
import { useActiveRepo } from "./hooks/useActiveRepo";
import { useRecentRepos } from "./hooks/useRecentRepos";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { Loader } from "./components/Loader";
import { SearchModal } from "./components/SearchModal";

function App() {
  const { activeRepo, isLoading, loadRepo, closeRepo } = useActiveRepo();
  const { recentRepos, isLoading: isRecentLoading, deleteRepo, refresh } = useRecentRepos();
  
  // Track visual index stage separating pick and animation
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (activeRepo) {
          setIsSearchOpen(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeRepo]);

  const handleSelectRepo = (path: string) => {
    setSelectedPath(path);
  };

  const handleIndexComplete = () => {
    if (selectedPath) {
      loadRepo(selectedPath);
      setSelectedPath(null);
      setActiveView("overview");
      // Refresh recents database listing
      refresh();
    }
  };

  // 1. Loading index animation phase
  if (selectedPath) {
    const repoName = selectedPath.split(/[/\\]/).pop() || "repository";
    return (
      <Loader 
        repoName={repoName} 
        onComplete={handleIndexComplete} 
      />
    );
  }

  // 2. Active dashboard workspace view
  if (activeRepo) {
    return (
      <>
        <Dashboard 
          repo={activeRepo} 
          onCloseRepo={() => {
            closeRepo();
            setActiveView("overview");
          }} 
          onSearchTrigger={() => setIsSearchOpen(true)}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          repoPath={activeRepo.path} 
          onNavigate={setActiveView}
        />
      </>
    );
  }

  // 3. Fallback Landing view
  return (
    <LandingPage
      recentRepos={recentRepos}
      onSelectRepo={handleSelectRepo}
      onDeleteRecent={deleteRepo}
      isRecentLoading={isRecentLoading || isLoading}
    />
  );
}

export default App;
