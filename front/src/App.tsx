import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import TableViewPage from './pages/TableViewPage';

export default function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    // Test connexion backend
    fetch('http://10.43.240.107:8000/')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Backend connecté:', data);
        setIsBackendReady(true);
      })
      .catch(err => {
        console.error('❌ Backend non accessible:', err);
        setBackendError(true);
      });
  }, []);

  if (backendError) {
    return (
      <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-xl mb-2">⚠️ Backend non accessible</h2>
          <p className="text-red-700 mb-4">
            Le serveur FastAPI ne répond pas sur http://127.0.0.1:8000
          </p>
          <p className="text-red-600 text-sm">
            Vérifiez que vous avez lancé : <code className="bg-red-100 px-2 py-1 rounded">uvicorn backend:app --reload</code>
          </p>
        </div>
      </div>
    );
  }

  if (!isBackendReady) {
    return (
      <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center">
        <div className="text-[#6b7280] tracking-tight">⟳ Connexion au backend...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" duration={4000} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/table/:region/:assembly" element={<TableViewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}