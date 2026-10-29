#!/usr/bin/env node
/**
 * Verification script to test the full stack integration
 */

import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const BACKEND_URL = 'http://localhost:3001';
const HARDHAT_RPC = 'http://localhost:8545';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function testBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/`, { method: 'GET', timeout: 3000 });
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function testHardhatRPC() {
  try {
    const res = await fetch(HARDHAT_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
      timeout: 3000
    });
    const data = await res.json();
    return { ok: !data.error, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('🧪 TracePath Integration Verification\n');
  
  console.log('⏳ Checking Hardhat RPC (localhost:8545)...');
  const hardhatTest = await testHardhatRPC();
  if (hardhatTest.ok) {
    console.log('✅ Hardhat RPC is responding');
  } else {
    console.log('❌ Hardhat RPC error:', hardhatTest.error);
  }
  
  console.log('\n⏳ Checking Backend Health (localhost:3001)...');
  const backendTest = await testBackendHealth();
  if (backendTest.ok) {
    console.log('✅ Backend is running:', backendTest.data);
  } else {
    console.log('❌ Backend error:', backendTest.error);
  }
  
  console.log('\n📋 Summary:');
  console.log(`   Hardhat: ${hardhatTest.ok ? '✅' : '❌'}`);
  console.log(`   Backend: ${backendTest.ok ? '✅' : '❌'}`);
  
  process.exit(hardhatTest.ok && backendTest.ok ? 0 : 1);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
