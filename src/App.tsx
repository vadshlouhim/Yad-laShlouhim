import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { Success } from './pages/Success';
import { Cancelled } from './pages/Cancelled';
import { Admin } from './pages/Admin';
import { News } from './pages/News';
import { NewsArticlePage } from './pages/NewsArticle';
import { FAQ } from './pages/FAQ';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsArticlePage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/achat/success" element={<Success />} />
          <Route path="/achat/succes" element={<Success />} />
          <Route path="/achat/cancelled" element={<Cancelled />} />
          <Route path="/achat/annule" element={<Cancelled />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;