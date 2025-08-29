import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './components/auth/AuthProvider';
import { HomePage } from './pages/HomePage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Success } from './pages/Success';
import { Cancelled } from './pages/Cancelled';
import { StripeSuccess } from './pages/StripeSuccess';
import { Admin } from './pages/Admin';
import { News } from './pages/News';
import { NewsArticlePage } from './pages/NewsArticle';
import { FAQ } from './pages/FAQ';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsArticlePage />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/achat/succes" element={<Success />} />
            <Route path="/achat/annule" element={<Cancelled />} />
            <Route path="/stripe-success" element={<StripeSuccess />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;