import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { AnalysisDetailPage } from '@/pages/AnalysisDetailPage';
import { Loader2 } from 'lucide-react';
import type { Page } from '@/lib/types';

function AppContent() {
  const { session, loading, signOut } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  const handleNavigate = (next: Page, analysisId?: string) => {
    if (analysisId) {
      setSelectedAnalysisId(analysisId);
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  // Reset to home page when user logs out
  useEffect(() => {
    if (!session && !loading) {
      setPage('home');
      setSelectedAnalysisId(null);
    }
  }, [session, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    if (page === 'signup') {
      return <SignUpPage onNavigate={handleNavigate} />;
    }
    return <LoginPage onNavigate={handleNavigate} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar currentPage={page} onNavigate={handleNavigate} />
      <main className="flex-1">
        {page === 'home' && <LandingPage onNavigate={handleNavigate} />}
        {page === 'analyze' && <AnalyzePage onNavigate={handleNavigate} />}
        {page === 'history' && <HistoryPage onNavigate={handleNavigate} />}
        {page === 'favorites' && <FavoritesPage onNavigate={handleNavigate} />}
        {page === 'detail' && selectedAnalysisId && (
          <AnalysisDetailPage analysisId={selectedAnalysisId} onNavigate={handleNavigate} />
        )}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
