const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const TracePath = await hre.ethers.getContractFactory("TracePath");
  const contract = await TracePath.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const artifact = await hre.artifacts.readArtifact("TracePath");
  
  // Write to frontend
  const frontendPath = path.join(__dirname, "../../frontend/src/contracts/contractInfo.json");
  fs.writeFileSync(frontendPath, JSON.stringify({ address, abi: artifact.abi }, null, 2));
  console.log(`Frontend contract info written to: ${frontendPath}`);
  
  // Write to backend
  const backendContractsDir = path.join(__dirname, "../../backend/src/contracts");
  if (!fs.existsSync(backendContractsDir)) {
    fs.mkdirSync(backendContractsDir, { recursive: true });
  }
  const backendPath = path.join(backendContractsDir, "contractInfo.json");
  fs.writeFileSync(backendPath, JSON.stringify({ address, abi: artifact.abi }, null, 2));
  console.log(`Backend contract info written to: ${backendPath}`);
  
  console.log(`TracePath deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
