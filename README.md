# TracePath — Blockchain Supply Chain Tracker

A starter college mini-project using React + Vite, Solidity, Hardhat, and ethers.js.

## Requirements
- Node.js LTS and npm
- VS Code
- MetaMask browser extension (for wallet-connected interactions)

## 1. Install frontend dependencies
Open a terminal in `TracePath/frontend`:
```bash
npm install
```

## 2. Install blockchain dependencies
Open another terminal in `TracePath/blockchain`:
```bash
npm install
```

## 3. Start a local blockchain
In `TracePath/blockchain`:
```bash
npm run node
```
Keep this terminal running. It prints local test accounts and private keys. Use only these local test accounts; never use them with real funds.

## 4. Deploy the smart contract
Open a second terminal in `TracePath/blockchain`:
```bash
npm run deploy:local
```
This deploys the contract to the local Hardhat network and writes the address/ABI to `frontend/src/contracts/contractInfo.json`.

## 5. Connect MetaMask to the local network
Add a network:
- Network name: Hardhat Local
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: `ETH`

Import one of the test accounts shown by the local Hardhat node using its displayed private key. These are local-only accounts.

## 6. Start the website
In `TracePath/frontend`:
```bash
npm run dev
```
Open the URL shown (usually `http://localhost:5173`).

## Demo flow
1. Connect MetaMask.
2. Register a batch (e.g. B-2026-001, Coffee Beans, Coorg, Karnataka).
3. Transfer it to another wallet address, or use a second local test account.
4. Add a quality/status update.
5. Search the batch ID on the public tracker.
6. Show the on-chain timeline and hash-linked event records.

## Notes
- This is a local educational demo, not a production supply-chain platform.
- The demo uses a custom on-chain record, not NFTs.
- Blockchain records are append-only in this contract. The UI demonstrates event history and linked hashes; it does not offer an unsafe "edit old record" feature.
- Do not commit private keys or `.env` files. Do not use real funds for this demo.
