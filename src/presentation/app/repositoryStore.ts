import { createContext, useContext } from 'react';
import type { SeriesRepository } from '../../domain/SeriesRepository';

export const RepositoryContext = createContext<SeriesRepository | null>(null);

export function useRepository(): SeriesRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) {
    throw new Error('useRepository must be used inside <RepositoryContext.Provider>');
  }
  return repo;
}
