import { useState } from 'react';
import Header, { type ViewName } from '@/components/Header';
import Footer from '@/components/Footer';
import Beranda from '@/components/Beranda';
import Ajukan from '@/components/Ajukan';
import CekStatus from '@/components/CekStatus';
import Dashboard from '@/components/Dashboard';

function App() {
  const [view, setView] = useState<ViewName>('beranda');
  const [isOperator, setIsOperator] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (v: ViewName) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOperatorLogout = () => {
    setIsOperator(false);
    navigate('beranda');
  };

  // Dashboard manages its own auth; when user logs in, mark as operator
  const handleOperatorLogin = () => {
    setIsOperator(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        currentView={view}
        onNavigate={navigate}
        isOperator={isOperator}
        onOperatorLogout={handleOperatorLogout}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <main className="flex-1">
        {view === 'beranda' && <Beranda onNavigate={navigate} />}
        {view === 'ajukan' && <Ajukan onNavigate={navigate} />}
        {view === 'cek' && <CekStatus />}
        {view === 'dashboard' && (
          <Dashboard onLogin={handleOperatorLogin} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
