import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import * as api from '../api';
import { Spinner } from './Spinner';

export function RegisterForm({ signer, contract, onSuccess, onError, onNavigate }) {
  const [form, setForm] = useState({
    batchId: 'B-2026-001',
    product: 'Coffee Beans',
    origin: 'Coorg, Karnataka',
    quantity: '100',
    harvestDate: new Date().toISOString().slice(0, 10)
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!signer || !contract) {
      onError('Connect MetaMask first');
      return;
    }

    setLoading(true);
    try {
      const { unsignedTx } = await api.registerBatchUnsigned({
        batchId: form.batchId.trim(),
        product: form.product.trim(),
        origin: form.origin.trim(),
        quantity: BigInt(form.quantity),
        harvestDate: form.harvestDate
      });

      const tx = await signer.sendTransaction(unsignedTx);
      await tx.wait();

      onSuccess('Batch registered successfully');
      setForm({
        batchId: 'B-2026-001',
        product: 'Coffee Beans',
        origin: 'Coorg, Karnataka',
        quantity: '100',
        harvestDate: new Date().toISOString().slice(0, 10)
      });
      
      setTimeout(() => {
        onNavigate('batch', form.batchId.trim());
      }, 1000);
    } catch (err) {
      onError(err.message || 'Failed to register batch');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-6 md:px-10 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="text-xs font-mono tracking-widest text-text-muted mb-2">ORIGIN STATION</div>
          <h2 className="text-3xl font-display font-bold text-primary-dark mb-2">Register a new batch</h2>
          <p className="text-sm text-text-secondary">Start a product's journey with a permanent on-chain record.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-primary mb-2">Batch ID</label>
            <input
              required
              type="text"
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              placeholder="B-2026-001"
              className="w-full border border-border rounded-lg bg-white px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:ring-2 focus:ring-accent-light focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-2">Product Type</label>
            <input
              required
              type="text"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              placeholder="Coffee Beans"
              className="w-full border border-border rounded-lg bg-white px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:ring-2 focus:ring-accent-light focus:outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-2">Origin</label>
              <input
                required
                type="text"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Coorg, Karnataka"
                className="w-full border border-border rounded-lg bg-white px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:ring-2 focus:ring-accent-light focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-2">Quantity (kg)</label>
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-border rounded-lg bg-white px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:ring-2 focus:ring-accent-light focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-2">Harvest Date</label>
            <input
              required
              type="date"
              value={form.harvestDate}
              onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
              className="w-full border border-border rounded-lg bg-white px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:ring-2 focus:ring-accent-light focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !contract}
            className="w-full bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner /> Signing transaction...
              </>
            ) : (
              <>
                Register Batch <ArrowLeftRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
