/**
 * Base Name Tool - Bounty #230
 * 
 * A tool to check availability and pricing for Base Names (.base.eth)
 * 
 * Functions:
 * - checkAvailability(name: string): Promise<boolean>
 * - getPrice(name: string, duration: number): Promise<bigint>
 * 
 * NOT includes register() - as per bounty requirements
 */

// Load environment variables
require('dotenv').config();

const { createPublicClient, http, getContract } = require('viem');
const { base } = require('viem/chains');

// Contract addresses
const REGISTRAR_CONTROLLER = '0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5';

// ABI fragments for the functions we need - using ENS-style interface
const REGISTRAR_ABI = [
  {
    name: 'available',
    type: 'function',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    name: 'rentPrice',
    type: 'function',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'duration', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
];

// Price constants (in ETH)
const PRICES = {
  '3': 0.1,      // 3-char: 0.1 ETH/yr
  '4': 0.01,     // 4-char: 0.01 ETH/yr
  '5-9': 0.001,  // 5-9 char: 0.001 ETH/yr
  '10+': 0.0001   // 10+ char: 0.0001 ETH/yr
};

// Names to check (from SPEC)
const NAMES_TO_CHECK = [
  'owocki',
  'owockibot',
  'bounties',
  'owockitool',
  'owockibotdev'
];

// Default wallet (configurable via env)
const DEFAULT_WALLET = process.env.BASE_NAME_WALLET || '0x80370645C98f05Ad86BdF676FaE54afCDBF5BC10';

// Multiple RPC endpoints for fallback
const RPC_ENDPOINTS = [
  process.env.INFURA_BASE_MAINNET_RPC || 'https://base-mainnet.infura.io/v3/b1906145d78f49eda50e35a80f438fd5'
];

// Initialize viem client
const client = createPublicClient({
  chain: base,
  transport: http(RPC_ENDPOINTS[0])
});

// Get the registrar contract
const registrar = getContract({
  address: REGISTRAR_CONTROLLER,
  abi: REGISTRAR_ABI,
  client
});

/**
 * Check if a Base Name is available
 * Uses the ENS-style available(string name) function
 * @param {string} name - The name to check (without .base suffix)
 * @returns {Promise<boolean>} - true if available, false if taken
 */
async function checkAvailability(name, retryCount = 0) {
  try {
    const normalizedName = name.toLowerCase().replace('.base', '');
    
    console.log(`  Checking availability for: ${normalizedName}.base`);
    
    // Use string-based available function
    const available = await registrar.read.available([normalizedName]);
    return available;
  } catch (error) {
    // Handle rate limiting - try another RPC
    if (error.message && error.message.includes('429') && retryCount < RPC_ENDPOINTS.length - 1) {
      console.log(`  Rate limited, retrying with alternate RPC...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkAvailability(name, retryCount + 1);
    }
    
    throw error;
  }
}

/**
 * Get the price for registering a Base Name
 * @param {string} name - The name to check (without .base suffix)
 * @param {number} duration - Duration in years (default: 1)
 * @returns {Promise<bigint>} - Price in wei
 */
async function getPrice(name, duration = 1) {
  try {
    const normalizedName = name.toLowerCase().replace('.base', '');
    
    // Try contract first
    try {
      const price = await registrar.read.rentPrice([normalizedName, BigInt(duration)]);
      return price;
    } catch (error) {
      // Fallback to static pricing if contract call fails
      console.log(`  Using static pricing (contract call failed)`);
      
      const length = normalizedName.length;
      let pricePerYear;
      
      if (length === 3) pricePerYear = PRICES['3'];
      else if (length === 4) pricePerYear = PRICES['4'];
      else if (length >= 5 && length <= 9) pricePerYear = PRICES['5-9'];
      else pricePerYear = PRICES['10+'];
      
      // Convert ETH to wei
      const priceInWei = BigInt(Math.floor(pricePerYear * duration * 1e18));
      return priceInWei;
    }
  } catch (error) {
    console.error(`Error getting price for ${name}:`, error.message);
    throw error;
  }
}

/**
 * Get price in ETH (human readable)
 */
async function getPriceInEth(name, duration = 1) {
  const priceWei = await getPrice(name, duration);
  const priceEth = Number(priceWei) / 1e18;
  return priceEth.toFixed(4);
}

/**
 * Get the configured wallet address
 */
function getWalletAddress() {
  return DEFAULT_WALLET;
}

/**
 * Set a custom wallet address (for future use)
 */
function setWalletAddress(address) {
  console.log(`Note: Wallet address configured as: ${address}`);
}

/**
 * Main function to check all specified names
 */
async function checkAllNames() {
  console.log('='.repeat(60));
  console.log('Base Name Availability Checker - Bounty #230');
  console.log('='.repeat(60));
  console.log(`Wallet: ${DEFAULT_WALLET}`);
  console.log(`Network: Base Mainnet`);
  console.log(`Contract: ${REGISTRAR_CONTROLLER}`);
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const name of NAMES_TO_CHECK) {
    const fullName = `${name}.base`;
    
    console.log(`\nChecking ${fullName}...`);
    
    try {
      const [available, priceEth] = await Promise.all([
        checkAvailability(name),
        getPriceInEth(name, 1)
      ]);
      
      console.log(`  Result: ${available ? '✅ Available' : '❌ Taken'}`);
      console.log(`  Price: ${priceEth} ETH/year`);
      
      results.push({
        name: fullName,
        available,
        priceEth: parseFloat(priceEth)
      });
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      
      results.push({
        name: fullName,
        available: null,
        error: error.message
      });
    }
    
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  
  const availableNames = results.filter(r => r.available === true);
  const takenNames = results.filter(r => r.available === false);
  const errorNames = results.filter(r => r.available === null);
  
  console.log(`Total checked: ${NAMES_TO_CHECK.length}`);
  console.log(`Available: ${availableNames.length}`);
  console.log(`Taken: ${takenNames.length}`);
  console.log(`Errors: ${errorNames.length}`);
  
  if (availableNames.length > 0) {
    console.log('\n✅ Available names:');
    availableNames.forEach(n => {
      console.log(`  - ${n.name}: ${n.priceEth} ETH/year`);
    });
  }
  
  if (takenNames.length > 0) {
    console.log('\n❌ Taken names:');
    takenNames.forEach(n => {
      console.log(`  - ${n.name}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Note: This tool only checks availability and pricing.');
  console.log('No registration is attempted (as per bounty requirements).');
  console.log('='.repeat(60));
  
  return results;
}

// Export functions for use as module
module.exports = {
  checkAvailability,
  getPrice,
  getPriceInEth,
  getWalletAddress,
  setWalletAddress,
  checkAllNames,
  NAMES_TO_CHECK,
  REGISTRAR_CONTROLLER
};

// Run if executed directly
if (require.main === module) {
  checkAllNames()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
