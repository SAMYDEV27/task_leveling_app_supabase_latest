import { useState, useEffect } from 'react';
import { User, LevelProgress } from '../lib/types';
import { getCurrentUser, getLevelProgress } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return { user, loading };
}

export function useLevelProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<LevelProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const levelProgress = await getLevelProgress(userId);
        setProgress(levelProgress);
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [userId]);

  return { progress, loading };
}
