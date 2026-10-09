import { keccak256, AbiCoder, toBeHex } from 'ethers';

export function verifyChainIntegrity(batchId, events) {
  if (!events || events.length === 0) {
    return { valid: true, invalidAt: null };
  }

  const abiCoder = AbiCoder.defaultAbiCoder();
  let previousHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    
    // Reconstruct the event hash using the same encoding as the contract
    let encoded;
    try {
      encoded = abiCoder.encode(
        ['string', 'string', 'address', 'string', 'string', 'uint256', 'bytes32'],
        [batchId, event.action, event.handler, event.location, event.note, event.timestamp, event.previousHash]
      );
    } catch (err) {
      console.error(`Error encoding event ${i}:`, err);
      return { valid: false, invalidAt: i };
    }

    const calculatedHash = keccak256(encoded);

    // Verify the event hash matches what was stored
    if (calculatedHash !== event.eventHash) {
      console.warn(`Hash mismatch at event ${i}: expected ${calculatedHash}, got ${event.eventHash}`);
      return { valid: false, invalidAt: i };
    }

    // Verify the previousHash chain link
    if (i === 0) {
      if (event.previousHash !== previousHash) {
        console.warn(`Previous hash mismatch at event ${i}: expected ${previousHash}, got ${event.previousHash}`);
        return { valid: false, invalidAt: i };
      }
    }

    previousHash = event.eventHash;
  }

  return { valid: true, invalidAt: null };
}
