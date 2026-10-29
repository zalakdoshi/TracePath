# TracePath 🔗

A blockchain-based document tracking system built on the Ethereum Sepolia testnet.

## Features
- 📄 Document hash registration on blockchain
- ✅ Tamper-proof document verification
- 🔐 User authentication
- 📊 Track document history on-chain

## Tech Stack
- **Frontend:** React, Vite, ethers.js
- **Backend:** Node.js, Express, SQLite
- **Blockchain:** Solidity, Sepolia Testnet (Alchemy RPC)

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Alchemy API key (Sepolia)

### Setup

**Backend**
```bash
cd backend
cp ../.env.example .env    # Fill in your values
npm install
npm start
```

**Frontend**
```bash
cd frontend
cp .env.example .env.local    # Fill in your values
npm install
npm run dev
```

## Environment Variables

**Backend `.env`**
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./db/tracepath.db
CONTRACT_ADDRESS=0x_your_deployed_contract_address
WALLET_ADDRESS=0x_your_wallet_address
PRIVATE_KEY=0x_your_private_key
```

**Frontend `.env.local`**
```
VITE_API_URL=http://localhost:5000
VITE_NETWORK=sepolia
VITE_CHAIN_ID=11155111
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
VITE_CONTRACT_ADDRESS=0x_your_deployed_contract_address
```
