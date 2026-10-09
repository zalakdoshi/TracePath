import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-dark text-accent-light rounded-lg flex items-center justify-center">
          <Leaf size={18} />
        </div>
        <span className="font-display font-bold text-sm">
          trace<span className="text-accent-muted">path</span>
        </span>
      </div>
      <p>TracePath · A blockchain supply chain tracker · Transparent by design</p>
      <span className="font-mono text-text-muted tracking-widest">LOCAL DEMO</span>
    </footer>
  );
}
