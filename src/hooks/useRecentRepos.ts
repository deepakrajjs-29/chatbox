import { useState, useEffect, useCallback } from "react";
import { RecentRepo } from "../types";
import { backendService } from "../services/backend";

export function useRecentRepos() {
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRecent = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await backendService.getRecentRepos();
      setRecentRepos(data);
    } catch (err) {
      console.error("Failed to load recent repos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRepo = useCallback(async (path: string, name: string) => {
    try {
      const data = await backendService.addRecentRepo(path, name);
      setRecentRepos(data);
    } catch (err) {
      console.error("Failed to add recent repo:", err);
    }
  }, []);

  const deleteRepo = useCallback(async (path: string) => {
    try {
      const data = await backendService.removeRecentRepo(path);
      setRecentRepos(data);
    } catch (err) {
      console.error("Failed to delete recent repo:", err);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return {
    recentRepos,
    isLoading,
    addRepo,
    deleteRepo,
    refresh: fetchRecent
  };
}
