import { Leaf, Wallet } from 'lucide-react';

const short = (s) => s ? `${s.slice(0, 8)}…${s.slice(-6)}` : '—';

export function Header({ account, onConnectWallet, currentPage, onNavigate }) {
  return (
    <header className="bg-white border-b border-border h-20 px-6 md:px-10 flex items-center justify-between gap-6">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 font-display font-bold text-2xl -tracking-wider text-primary-dark hover:opacity-80 transition"
      >
        <div className="w-10 h-10 bg-primary-dark text-accent-light rounded-lg flex items-center justify-center">
          <Leaf size={24} />
        </div>
        <span>
          trace<span className="text-accent-muted">path</span>
        </span>
      </button>

      <nav className="flex gap-6 text-sm text-text-secondary">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-primary-dark transition ${
            currentPage === 'dashboard' ? 'text-primary-dark font-bold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('register')}
          className={`hover:text-primary-dark transition ${
            currentPage === 'register' ? 'text-primary-dark font-bold' : ''
          }`}
        >
          Register
        </button>
        <button
          onClick={() => onNavigate('track')}
          className={`hover:text-primary-dark transition ${
            currentPage === 'track' ? 'text-primary-dark font-bold' : ''
          }`}
        >
          Track
        </button>
      </nav>

      <button
        onClick={onConnectWallet}
        className="flex items-center gap-2 border border-border rounded-lg bg-white px-4 py-2.5 text-primary-dark text-xs font-bold hover:bg-gray-50 transition"
      >
        <Wallet size={16} />
        {account ? short(account) : 'Connect wallet'}
      </button>
    </header>
  );
}
