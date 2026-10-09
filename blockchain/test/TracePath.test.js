const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TracePath", function () {
  async function deploy() {
    const [owner, processor, retailer, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TracePath");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, owner, processor, retailer, outsider };
  }

  it("registers a batch and records its first history event", async function () {
    const { contract, owner } = await deploy();
    await contract.registerBatch("B-2026-001", "Coffee Beans", "Coorg, Karnataka", 100, "2026-10-01");
    const batch = await contract.getBatch("B-2026-001");
    const history = await contract.getHistory("B-2026-001");
    expect(batch.currentHolder).to.equal(owner.address);
    expect(batch.eventCount).to.equal(1);
    expect(history[0].action).to.equal("Created");
  });

  it("allows only the current holder to transfer", async function () {
    const { contract, owner, processor, retailer, outsider } = await deploy();
    await contract.registerBatch("B-2026-002", "Coffee Beans", "Coorg", 50, "2026-10-01");
    await expect(contract.connect(outsider).transferBatch("B-2026-002", processor.address, "Mysuru", "Received"))
      .to.be.revertedWith("Only current holder can transfer");
    await contract.transferBatch("B-2026-002", processor.address, "Mysuru", "Received");
    await expect(contract.transferBatch("B-2026-002", retailer.address, "Pune", "Handoff"))
      .to.be.revertedWith("Only current holder can transfer");
    expect(owner.address).to.not.equal(processor.address);
  });

  it("links each history event to the previous event hash", async function () {
    const { contract, processor } = await deploy();
    await contract.registerBatch("B-2026-003", "Coffee Beans", "Coorg", 25, "2026-10-01");
    await contract.transferBatch("B-2026-003", processor.address, "Mysuru", "Quality passed");
    const history = await contract.getHistory("B-2026-003");
    expect(history[1].previousHash).to.equal(history[0].eventHash);
  });
});
