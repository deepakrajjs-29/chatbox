import { useState, useCallback } from "react";
import { Repository } from "../types";
import { backendService } from "../services/backend";

export function useActiveRepo() {
  const [activeRepo, setActiveRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadRepo = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const repo = await backendService.loadRepository(path);
      setActiveRepo(repo);
    } catch (err: any) {
      console.error("Failed to load repo:", err);
      setError(err?.message || "An error occurred while parsing the repository.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeRepo = useCallback(() => {
    setActiveRepo(null);
    setError(null);
  }, []);

  return {
    activeRepo,
    isLoading,
    error,
    loadRepo,
    closeRepo
  };
}
