import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { StockDetailPage } from './pages/StockDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { SearchResultPage } from './pages/SearchResultPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'stocks/:id', element: <StockDetailPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'search', element: <SearchResultPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
