import { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, MapPin, Clock3, Sprout, PackageCheck } from 'lucide-react';
import * as api from '../api';
import { Spinner } from './Spinner';

const short = (s) => s ? `${s.slice(0, 8)}…${s.slice(-6)}` : '—';
const dateText = (n) => n ? new Date(Number(n) * 1000).toLocaleString() : 'Pending';

export function TrackPage({ onError }) {
  const [searchId, setSearchId] = useState('');
  const [tracked, setTracked] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    try {
      const history = await api.getBatchHistory(searchId.trim());
      setTracked(history);
    } catch (err) {
      onError(err.message);
      setTracked(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-6 md:px-10 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="text-xs font-mono tracking-widest text-text-muted mb-2">PUBLIC TRACE</div>
          <h2 className="text-3xl font-display font-bold text-primary-dark mb-2">Follow the journey</h2>
          <p className="text-sm text-text-secondary">Look up a batch to inspect its recorded milestones. No login required.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 flex items-center gap-3 bg-white border border-border rounded-lg px-4 py-3">
            <Search size={20} className="text-text-muted" />
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter batch ID, e.g. B-2026-001"
              className="flex-1 bg-transparent outline-none text-sm text-text-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-light disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg transition"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {loading && (
          <div className="bg-white rounded-lg border border-border p-12 flex justify-center">
            <Spinner />
          </div>
        )}

        {tracked && (
          <div className="bg-white rounded-lg border border-border p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
              <div>
                <div className="text-xs font-mono tracking-widest text-text-muted mb-2">BATCH RECORD</div>
                <h3 className="text-2xl font-display font-bold text-primary-dark mb-1">
                  Batch <span className="font-mono bg-gray-100 px-2 py-1 rounded">{tracked.batchId}</span>
                </h3>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
                tracked.integrity.valid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {tracked.integrity.valid ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                {tracked.integrity.valid ? 'Chain Valid' : 'Tampered'}
              </div>
            </div>

            {tracked.events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary">No events recorded yet for this batch.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tracked.events.map((event, i) => (
                  <div key={`${event.eventHash}-${i}`} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent-muted">
                        {i === 0 ? <Sprout size={16} /> : <PackageCheck size={16} />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <b className="text-sm font-display text-text-primary">{event.action}</b>
                        <time className="text-xs text-text-muted whitespace-nowrap">{dateText(event.timestamp)}</time>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{event.note}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {event.location}
                        </span>
                        <span className="font-mono">Handler: {short(event.handler)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && !tracked && (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-accent-muted" />
            </div>
            <b className="block text-sm font-display text-primary-dark mb-1">Search for a batch</b>
            <p className="text-xs text-text-secondary">Enter a batch ID to view its complete journey and verify its integrity.</p>
          </div>
        )}
      </div>
    </section>
  );
}
