import { CssBaseline } from '@mui/material';
import type { SeriesRepository } from '../../domain/SeriesRepository';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { ErrorBoundary } from './ErrorBoundary';
import { RepositoryContext } from './repositoryStore';

interface Props {
  repository: SeriesRepository;
}

export function App({ repository }: Props) {
  return (
    <>
      <CssBaseline />
      <ErrorBoundary>
        <RepositoryContext.Provider value={repository}>
          <MainLayout />
        </RepositoryContext.Provider>
      </ErrorBoundary>
    </>
  );
}
