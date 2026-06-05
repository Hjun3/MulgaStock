import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StockDetailPage from './pages/StockDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import SearchResultPage from './pages/SearchResultPage';
import NotFoundPage from './pages/NotFoundPage';

// 전체 페이지 틀: 위에 Header, 아래에 Footer, 가운데에 페이지 내용
export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stocks/:id" element={<StockDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/search" element={<SearchResultPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
