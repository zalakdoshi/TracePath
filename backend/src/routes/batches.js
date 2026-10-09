import express from 'express';
import { Contract } from 'ethers';
import { getBatchMetadata, setBatchMetadata } from '../db.js';
import { generateQR } from '../qrcode.js';
import { verifyChainIntegrity } from '../utils/chainVerifier.js';

export function createBatchesRouter(contractInstance, frontendUrl) {
  const router = express.Router();

  // 1. GET /api/batches - list all batch IDs
  router.get('/', async (req, res) => {
    try {
      const batchIds = await contractInstance.getBatchIds();
      const summaries = [];

      for (const batchId of batchIds) {
        const batch = await contractInstance.getBatch(batchId);
        summaries.push({
          id: batchId,
          product: batch.product,
          origin: batch.origin,
          quantity: batch.quantity.toString(),
          currentHolder: batch.currentHolder,
          eventCount: batch.eventCount.toString(),
          active: batch.active
        });
      }

      res.json(summaries);
    } catch (error) {
      console.error('Error fetching batches:', error);
      res.status(500).json({ error: 'Failed to fetch batches' });
    }
  });

  // 2. GET /api/batches/:id - get batch details
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const batch = await contractInstance.getBatch(id);
      res.json({
        batchId: batch.batchId,
        product: batch.product,
        origin: batch.origin,
        quantity: batch.quantity.toString(),
        harvestDate: batch.harvestDate,
        currentHolder: batch.currentHolder,
        active: batch.active,
        eventCount: batch.eventCount.toString()
      });
    } catch (error) {
      console.error(`Error fetching batch ${req.params.id}:`, error);
      res.status(400).json({ error: `Batch not found: ${req.params.id}` });
    }
  });

  // 3. GET /api/batches/:id/history - get history with integrity check
  router.get('/:id/history', async (req, res) => {
    try {
      const { id } = req.params;
      const history = await contractInstance.getHistory(id);
      
      const events = history.map(event => ({
        action: event.action,
        handler: event.handler,
        location: event.location,
        note: event.note,
        timestamp: event.timestamp.toString(),
        previousHash: event.previousHash,
        eventHash: event.eventHash
      }));

      const integrityResult = verifyChainIntegrity(id, events);

      res.json({
        batchId: id,
        events,
        integrity: {
          valid: integrityResult.valid,
          invalidAt: integrityResult.invalidAt
        }
      });
    } catch (error) {
      console.error(`Error fetching history for ${req.params.id}:`, error);
      res.status(400).json({ error: `Failed to fetch history: ${req.params.id}` });
    }
  });

  // 4. POST /api/batches - register batch (returns unsigned tx)
  router.post('/', async (req, res) => {
    try {
      const { batchId, product, origin, quantity, harvestDate, metadata } = req.body;

      if (!batchId || !product || !origin || !quantity || !harvestDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Store metadata if provided
      if (metadata) {
        await setBatchMetadata(batchId, metadata);
      }

      // Build unsigned transaction for registerBatch
      const tx = await contractInstance.registerBatch.populateTransaction(
        batchId,
        product,
        origin,
        quantity,
        harvestDate
      );

      res.json({
        unsignedTx: {
          to: tx.to,
          data: tx.data,
          value: tx.value ? tx.value.toString() : '0'
        },
        message: 'Sign this transaction with MetaMask to register batch'
      });
    } catch (error) {
      console.error('Error registering batch:', error);
      res.status(400).json({ error: `Failed to prepare batch registration: ${error.message}` });
    }
  });

  // 5. POST /api/batches/:id/transfer - transfer batch
  router.post('/:id/transfer', async (req, res) => {
    try {
      const { id } = req.params;
      const { to, location, note } = req.body;

      if (!to || !location || !note) {
        return res.status(400).json({ error: 'Missing required fields: to, location, note' });
      }

      // Build unsigned transaction for transferBatch
      const tx = await contractInstance.transferBatch.populateTransaction(
        id,
        to,
        location,
        note
      );

      res.json({
        unsignedTx: {
          to: tx.to,
          data: tx.data,
          value: tx.value ? tx.value.toString() : '0'
        },
        message: 'Sign this transaction with MetaMask to transfer batch'
      });
    } catch (error) {
      console.error(`Error preparing transfer for ${id}:`, error);
      res.status(400).json({ error: `Failed to prepare transfer: ${error.message}` });
    }
  });

  // 6. POST /api/batches/:id/update - add status update
  router.post('/:id/update', async (req, res) => {
    try {
      const { id } = req.params;
      const { location, note } = req.body;

      if (!location || !note) {
        return res.status(400).json({ error: 'Missing required fields: location, note' });
      }

      // Build unsigned transaction for addUpdate
      const tx = await contractInstance.addUpdate.populateTransaction(
        id,
        location,
        note
      );

      res.json({
        unsignedTx: {
          to: tx.to,
          data: tx.data,
          value: tx.value ? tx.value.toString() : '0'
        },
        message: 'Sign this transaction with MetaMask to add update'
      });
    } catch (error) {
      console.error(`Error preparing update for ${id}:`, error);
      res.status(400).json({ error: `Failed to prepare update: ${error.message}` });
    }
  });

  // 7. GET /api/batches/:id/qr - generate QR code
  router.get('/:id/qr', async (req, res) => {
    try {
      const { id } = req.params;
      const trackUrl = `${frontendUrl}/track?batch=${encodeURIComponent(id)}`;
      const qrBuffer = await generateQR(trackUrl);

      res.type('image/png');
      res.send(qrBuffer);
    } catch (error) {
      console.error(`Error generating QR for ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  });

  return router;
}
