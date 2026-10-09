import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Contract, JsonRpcProvider, getAddress } from 'ethers';
import { initDB } from './db.js';
import { createBatchesRouter } from './routes/batches.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Load contract info
let contractInfo = null;
try {
  const contractPath = join(__dirname, 'contracts', 'contractInfo.json');
  contractInfo = JSON.parse(readFileSync(contractPath, 'utf8'));
  console.log(`Contract info loaded from ${contractPath}`);
} catch (error) {
  console.error('Error loading contract info:', error.message);
  console.error('Make sure to run deploy:local first');
  process.exit(1);
}

// Initialize ethers provider and contract
const provider = new JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
const contract = new Contract(
  getAddress(contractInfo.address),
  contractInfo.abi,
  provider
);

console.log(`Connected to contract at: ${contractInfo.address}`);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount batches routes
app.use('/api/batches', createBatchesRouter(contract, process.env.FRONTEND_URL || 'http://localhost:5173'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}`);
      console.log(`Contract address: ${contractInfo.address}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();
