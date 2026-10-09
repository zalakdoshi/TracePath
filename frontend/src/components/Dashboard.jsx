import { useState, useEffect } from 'react';
import { PackageCheck, ExternalLink } from 'lucide-react';
import * as api from '../api';
import { Spinner } from './Spinner';

const short = (s) => s ? `${s.slice(0, 8)}…${s.slice(-6)}` : '—';

export function Dashboard({ onNavigateToBatch, onError }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  async function loadBatches() {
    setLoading(true);
    try {
      const data = await api.getBatches();
      setBatches(data.reverse());
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-6 md:px-10 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="text-xs font-mono tracking-widest text-text-muted mb-2">ON-CHAIN INVENTORY</div>
          <h2 className="text-3xl font-display font-bold text-primary-dark mb-2">Recent batches</h2>
          <p className="text-sm text-text-secondary">View and manage all registered product batches.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-border p-12 flex justify-center">
            <Spinner />
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
              <PackageCheck size={24} className="text-accent-muted" />
            </div>
            <b className="block text-sm font-display text-primary-dark mb-1">No batches yet</b>
            <p className="text-xs text-text-secondary">Register your first product batch to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr className="text-left text-xs font-bold text-primary-dark uppercase tracking-wide">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Batch ID</th>
                    <th className="px-6 py-4">Origin</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Events</th>
                    <th className="px-6 py-4">Current Holder</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {batches.map((batch) => (
                    <tr
                      key={batch.id}
                      onClick={() => onNavigateToBatch(batch.id)}
                      className="hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-primary">{batch.product}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs px-2 py-1 bg-gray-100 rounded text-text-secondary inline-block">
                          {batch.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{batch.origin}</td>
                      <td className="px-6 py-4 text-text-secondary">{batch.quantity} kg</td>
                      <td className="px-6 py-4 font-mono text-xs bg-accent-light text-accent-muted px-2 py-1 rounded inline-block">
                        {batch.eventCount}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-text-secondary">{short(batch.currentHolder)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          batch.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {batch.active ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ExternalLink size={16} className="text-accent-muted" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
