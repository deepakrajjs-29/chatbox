import { useState, useEffect } from "react";
import { useActiveRepo } from "./hooks/useActiveRepo";
import { useRecentRepos } from "./hooks/useRecentRepos";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { Loader } from "./components/Loader";
import { SearchModal } from "./components/SearchModal";
import { AlertTriangle, RefreshCw, LogOut } from "lucide-react";

function App() {
  const { activeRepo, isLoading, error, loadRepo, closeRepo } = useActiveRepo();
  const { recentRepos, isLoading: isRecentLoading, deleteRepo, refresh } = useRecentRepos();

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (activeRepo) {
          setIsSearchOpen((prev) => !prev);
        }
      }
      // ESC to close search
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeRepo, isSearchOpen]);

  const handleSelectRepo = (path: string) => {
    setSelectedPath(path);
  };

  const handleIndexComplete = () => {
    if (selectedPath) {
      loadRepo(selectedPath);
      setSelectedPath(null);
      setActiveView("overview");
      refresh();
    }
  };

  // 1. Loading/Indexing phase
  if (selectedPath) {
    const repoName = selectedPath.split(/[/\\]/).pop() || "repository";
    return (
      <Loader
        repoName={repoName}
        onComplete={handleIndexComplete}
      />
    );
  }

  // 2. Loading repo data (post-indexing)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Loading repository analysis...</p>
        </div>
      </div>
    );
  }

  // 3. Error state
  if (error && !activeRepo) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-2xl border border-danger/20 bg-danger/5 max-w-sm w-full text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Failed to Load Repository</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => selectedPath && loadRepo(selectedPath)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
            <button
              onClick={closeRepo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Active Dashboard
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
          onNavigate={(view) => {
            setActiveView(view);
            setIsSearchOpen(false);
          }}
        />
      </>
    );
  }

  // 5. Landing Page
  return (
    <LandingPage
      recentRepos={recentRepos}
      onSelectRepo={handleSelectRepo}
      onDeleteRecent={deleteRepo}
      isRecentLoading={isRecentLoading}
    />
  );
}

export default App;
