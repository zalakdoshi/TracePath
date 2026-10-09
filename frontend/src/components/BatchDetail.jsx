import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, MapPin, Clock3, Sprout, PackageCheck, Image, ArrowLeft, Loader2 } from 'lucide-react';
import * as api from '../api';
import { Spinner } from './Spinner';

const short = (s) => s ? `${s.slice(0, 8)}…${s.slice(-6)}` : '—';
const dateText = (n) => n ? new Date(Number(n) * 1000).toLocaleString() : 'Pending';

export function BatchDetail({ batchId, onBack, onError }) {
  const [batch, setBatch] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadBatch();
  }, [batchId]);

  async function loadBatch() {
    setLoading(true);
    try {
      const [batchData, historyData] = await Promise.all([
        api.getBatch(batchId),
        api.getBatchHistory(batchId)
      ]);
      setBatch(batchData);
      setHistory(historyData);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-accent-muted hover:text-primary-dark transition mb-6">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="bg-white rounded-lg border border-border p-12 flex justify-center">
            <Spinner />
          </div>
        </div>
      </section>
    );
  }

  if (!batch || !history) {
    return (
      <section className="px-6 md:px-10 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-accent-muted hover:text-primary-dark transition mb-6">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="bg-white rounded-lg border border-border p-8 text-center">
            <AlertTriangle size={32} className="mx-auto text-red-600 mb-4" />
            <p className="text-sm text-text-secondary">Batch not found</p>
          </div>
        </div>
      </section>
    );
  }

  const isValid = history.integrity.valid;
  const qrUrl = api.getBatchQRUrl(batchId);

  return (
    <section className="px-6 md:px-10 py-10">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-accent-muted hover:text-primary-dark transition mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-lg border border-border p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
            <div>
              <div className="text-xs font-mono tracking-widest text-text-muted mb-2">BATCH RECORD</div>
              <h2 className="text-3xl font-display font-bold text-primary-dark mb-1">
                {batch.product} <span className="font-mono text-lg bg-gray-100 px-2 py-1 rounded">{batchId}</span>
              </h2>
              <p className="text-sm text-text-secondary">
                {batch.origin} · {batch.quantity} kg · Harvest: {batch.harvestDate}
              </p>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
              isValid && batch.active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isValid && batch.active ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
              {isValid && batch.active ? 'Integrity Valid' : 'Check Status'}
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-xs text-text-muted font-bold mb-1">Current Holder</div>
                <div className="font-mono text-xs text-text-primary break-all">{short(batch.currentHolder)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-bold mb-1">Status</div>
                <div className={`text-xs font-bold ${batch.active ? 'text-green-600' : 'text-red-600'}`}>
                  {batch.active ? 'Active' : 'Revoked'}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-bold mb-1">Event Count</div>
                <div className="font-mono text-xs text-text-primary">{history.events.length}</div>
              </div>
              <div>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="text-xs font-bold text-accent-muted hover:text-primary-dark transition flex items-center gap-1"
                >
                  <Image size={14} /> View QR
                </button>
              </div>
            </div>

            {showQR && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
                <img
                  src={qrUrl}
                  alt="Batch QR Code"
                  className="w-32 h-32 mx-auto border border-border rounded"
                  onError={() => onError('Failed to load QR code')}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-8">
          <h3 className="text-lg font-display font-bold text-primary-dark mb-6">Timeline</h3>
          
          <div className="space-y-6">
            {history.events.map((event, i) => (
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
                  <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {event.location}
                    </span>
                    <span className="font-mono">Handler: {short(event.handler)}</span>
                  </div>
                  <details className="text-xs text-text-muted">
                    <summary className="cursor-pointer font-bold hover:text-text-secondary transition">
                      View hash details
                    </summary>
                    <div className="mt-2 bg-gray-50 p-3 rounded font-mono text-xs break-all space-y-1">
                      <div>
                        <span className="font-bold">Event hash: </span>
                        {event.eventHash}
                      </div>
                      <div>
                        <span className="font-bold">Previous hash: </span>
                        {event.previousHash}
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
