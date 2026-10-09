require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const getPrivateKey = () => {
  const key = process.env.PRIVATE_KEY;
  if (!key) return undefined;
  // Ensure key has 0x prefix and is 66 characters (0x + 64 hex chars)
  const normalized = key.startsWith('0x') ? key : '0x' + key;
  if (normalized.length === 66) {
    return normalized;
  }
  // For local testing, return undefined if key is invalid
  console.warn('⚠️  Invalid PRIVATE_KEY length. Sepolia network will be unavailable.');
  return undefined;
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    ...(process.env.SEPOLIA_RPC_URL && getPrivateKey() && {
      sepolia: {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: [getPrivateKey()]
      }
    })
  }
};
