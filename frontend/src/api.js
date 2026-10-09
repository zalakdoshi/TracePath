const API_BASE = '/api';

/**
 * Get all batches
 */
export async function getBatches() {
  const res = await fetch(`${API_BASE}/batches`);
  if (!res.ok) throw new Error('Failed to fetch batches');
  return res.json();
}

/**
 * Get batch details
 */
export async function getBatch(id) {
  const res = await fetch(`${API_BASE}/batches/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Batch not found: ${id}`);
  return res.json();
}

/**
 * Get batch history with integrity check
 */
export async function getBatchHistory(id) {
  const res = await fetch(`${API_BASE}/batches/${encodeURIComponent(id)}/history`);
  if (!res.ok) throw new Error(`Failed to fetch history: ${id}`);
  return res.json();
}

/**
 * Register batch (returns unsigned tx)
 */
export async function registerBatchUnsigned(data) {
  const res = await fetch(`${API_BASE}/batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to prepare batch registration');
  return res.json();
}

/**
 * Transfer batch (returns unsigned tx)
 */
export async function transferBatchUnsigned(batchId, data) {
  const res = await fetch(`${API_BASE}/batches/${encodeURIComponent(batchId)}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to prepare batch transfer');
  return res.json();
}

/**
 * Add status update (returns unsigned tx)
 */
export async function updateBatchUnsigned(batchId, data) {
  const res = await fetch(`${API_BASE}/batches/${encodeURIComponent(batchId)}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to prepare status update');
  return res.json();
}

/**
 * Get QR code URL for a batch
 */
export function getBatchQRUrl(id) {
  return `${API_BASE}/batches/${encodeURIComponent(id)}/qr`;
}
