import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadJsonSeriesRepository } from './data/JsonSeriesRepository';
import { App } from './presentation/app/App';
import { DATASETS, currentDataset } from './presentation/app/dataset-switcher';

const root = createRoot(document.getElementById('root')!);

// load data via fetch so data won't be inside js bundle, and it also simulates real request to api
loadJsonSeriesRepository(DATASETS[currentDataset()].url).then(
  (repository) =>
    root.render(
      <StrictMode>
        <App repository={repository} />
      </StrictMode>,
    ),
  (error: unknown) => root.render(<p role="alert">Failed to load data: {String(error)}</p>),
);
