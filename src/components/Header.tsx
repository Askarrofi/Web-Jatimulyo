import { Landmark, Home, FileText, Search, ShieldCheck, X } from 'lucide-react';

export type ViewName = 'beranda' | 'ajukan' | 'cek' | 'dashboard';

interface HeaderProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
  isOperator: boolean;
  onOperatorLogout: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const NAV_ITEMS: { key: ViewName; label: string; icon: typeof Home }[] = [
  { key: 'beranda', label: 'Beranda', icon: Home },
  { key: 'ajukan', label: 'Ajukan Layanan', icon: FileText },
  { key: 'cek', label: 'Cek Status', icon: Search },
];

export default function Header({
  currentView,
  onNavigate,
  isOperator,
  onOperatorLogout,
  mobileMenuOpen,
  onToggleMobileMenu,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <button
            onClick={() => onNavigate('beranda')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-bold text-slate-800 leading-tight hidden sm:block">
                Desa Jatimulyo
              </h1>
              <p className="text-xs text-slate-500 leading-tight hidden sm:block">
                Jati Agung, Lampung Selatan
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            {isOperator ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-accent-50 text-accent-700'
                      : 'text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={onOperatorLogout}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50 transition-all"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Login Operator
              </button>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-slate-200 bg-white animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate(item.key);
                    onToggleMobileMenu();
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              {isOperator ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      onToggleMobileMenu();
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'dashboard' ? 'bg-accent-50 text-accent-700' : 'text-accent-600 hover:bg-accent-50'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Dashboard Operator
                  </button>
                  <button
                    onClick={() => {
                      onOperatorLogout();
                      onToggleMobileMenu();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-error-600 hover:bg-error-50"
                  >
                    <X className="w-5 h-5" />
                    Keluar Operator
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    onToggleMobileMenu();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium bg-slate-800 text-white"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Login Operator
                </button>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
