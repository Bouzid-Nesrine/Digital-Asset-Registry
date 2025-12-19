/**
 * Mock Blockchain Service
 * 
 * This service simulates blockchain interactions for the Digital Asset Registry DApp.
 * In production, replace mock functions with actual smart contract calls using ethers.js.
 * 
 * Target Network: Sepolia Testnet (Chain ID: 11155111)
 */

import { Asset, AssetType, UsageRecord, TransactionResult, SEPOLIA_CHAIN_ID } from '@/types/asset';

// Placeholder Smart Contract ABI (simplified for demo)
export const CONTRACT_ABI = [
  "function registerAsset(string name, string assetType, string description, bytes32 hash) public returns (uint256)",
  "function getMyAssets() public view returns (tuple(uint256 id, string name, string assetType, string description, bytes32 hash, address owner, uint256 createdAt, address[] authorizedUsers)[])",
  "function transferOwnership(uint256 assetId, address newOwner) public",
  "function grantAccess(uint256 assetId, address user) public",
  "function revokeAccess(uint256 assetId, address user) public",
  "function getUsageHistory(address user) public view returns (tuple(uint256 assetId, string action, address user, uint256 timestamp)[])"
];

// Placeholder contract address (deploy your own contract and update this)
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// In-memory storage for mock data
let mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Climate Dataset 2024',
    type: 'Dataset',
    description: 'Comprehensive climate data from 150 weather stations across North America, collected between 2020-2024.',
    hash: 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD88',
    createdAt: new Date('2024-01-15'),
    authorizedUsers: ['0x8ba1f109551bD432803012645Ac136ddd64DBA72'],
  },
  {
    id: '2',
    name: 'GPT-Nano Model',
    type: 'Model',
    description: 'A lightweight transformer model optimized for edge devices with 125M parameters.',
    hash: 'b9f5e8c2d1a3f7e9c6b4a2d8f1e3c5b7a9d2f4e6c8b1a3d5f7e9c2b4a6d8f1e3',
    owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD88',
    createdAt: new Date('2024-02-20'),
    authorizedUsers: [],
  },
  {
    id: '3',
    name: 'Blockchain Audit Library',
    type: 'Code',
    description: 'Open-source smart contract auditing toolkit with automated vulnerability detection.',
    hash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    owner: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    createdAt: new Date('2024-03-10'),
    authorizedUsers: ['0x742d35Cc6634C0532925a3b844Bc9e7595f2bD88'],
  },
];

let mockUsageHistory: UsageRecord[] = [
  {
    id: '1',
    assetId: '1',
    assetName: 'Climate Dataset 2024',
    action: 'registered',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD88',
    timestamp: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    assetId: '2',
    assetName: 'GPT-Nano Model',
    action: 'registered',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD88',
    timestamp: new Date('2024-02-20T14:15:00'),
  },
  {
    id: '3',
    assetId: '1',
    assetName: 'Climate Dataset 2024',
    action: 'access_granted',
    walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    timestamp: new Date('2024-02-25T09:00:00'),
  },
  {
    id: '4',
    assetId: '3',
    assetName: 'Blockchain Audit Library',
    action: 'registered',
    walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    timestamp: new Date('2024-03-10T11:45:00'),
  },
];

// Simulate transaction delay
const simulateTransaction = <T>(result: T, delay = 1500): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
};

/**
 * Generate a mock transaction hash
 */
const generateTxHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

/**
 * Register a new asset on the blockchain
 */
export async function registerAsset(
  name: string,
  type: AssetType,
  description: string,
  hash: string,
  ownerAddress: string
): Promise<TransactionResult> {
  try {
    const newAsset: Asset = {
      id: String(mockAssets.length + 1),
      name,
      type,
      description,
      hash,
      owner: ownerAddress,
      createdAt: new Date(),
      authorizedUsers: [],
    };

    mockAssets.push(newAsset);

    // Add usage record
    mockUsageHistory.push({
      id: String(mockUsageHistory.length + 1),
      assetId: newAsset.id,
      assetName: name,
      action: 'registered',
      walletAddress: ownerAddress,
      timestamp: new Date(),
    });

    return simulateTransaction({
      success: true,
      hash: generateTxHash(),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get assets owned by or authorized to a specific wallet address
 */
export async function getMyAssets(walletAddress: string): Promise<Asset[]> {
  const assets = mockAssets.filter(
    (asset) =>
      asset.owner.toLowerCase() === walletAddress.toLowerCase() ||
      asset.authorizedUsers.some(
        (user) => user.toLowerCase() === walletAddress.toLowerCase()
      )
  );
  return simulateTransaction(assets, 500);
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(assetId: string): Promise<Asset | null> {
  const asset = mockAssets.find((a) => a.id === assetId);
  return simulateTransaction(asset || null, 300);
}

/**
 * Transfer ownership of an asset to a new address
 */
export async function transferOwnership(
  assetId: string,
  currentOwner: string,
  newOwner: string
): Promise<TransactionResult> {
  try {
    const asset = mockAssets.find((a) => a.id === assetId);
    
    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }
    
    if (asset.owner.toLowerCase() !== currentOwner.toLowerCase()) {
      return { success: false, error: 'Not the owner of this asset' };
    }

    asset.owner = newOwner;

    mockUsageHistory.push({
      id: String(mockUsageHistory.length + 1),
      assetId,
      assetName: asset.name,
      action: 'transferred',
      walletAddress: newOwner,
      timestamp: new Date(),
      details: `From ${currentOwner} to ${newOwner}`,
    });

    return simulateTransaction({
      success: true,
      hash: generateTxHash(),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Grant access to an asset for a specific wallet address
 */
export async function grantAccess(
  assetId: string,
  ownerAddress: string,
  userAddress: string
): Promise<TransactionResult> {
  try {
    const asset = mockAssets.find((a) => a.id === assetId);
    
    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }
    
    if (asset.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
      return { success: false, error: 'Not the owner of this asset' };
    }

    if (!asset.authorizedUsers.includes(userAddress)) {
      asset.authorizedUsers.push(userAddress);
    }

    mockUsageHistory.push({
      id: String(mockUsageHistory.length + 1),
      assetId,
      assetName: asset.name,
      action: 'access_granted',
      walletAddress: userAddress,
      timestamp: new Date(),
    });

    return simulateTransaction({
      success: true,
      hash: generateTxHash(),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Revoke access from a user for a specific asset
 */
export async function revokeAccess(
  assetId: string,
  ownerAddress: string,
  userAddress: string
): Promise<TransactionResult> {
  try {
    const asset = mockAssets.find((a) => a.id === assetId);
    
    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }
    
    if (asset.owner.toLowerCase() !== ownerAddress.toLowerCase()) {
      return { success: false, error: 'Not the owner of this asset' };
    }

    asset.authorizedUsers = asset.authorizedUsers.filter(
      (user) => user.toLowerCase() !== userAddress.toLowerCase()
    );

    mockUsageHistory.push({
      id: String(mockUsageHistory.length + 1),
      assetId,
      assetName: asset.name,
      action: 'access_revoked',
      walletAddress: userAddress,
      timestamp: new Date(),
    });

    return simulateTransaction({
      success: true,
      hash: generateTxHash(),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get usage history for all assets or filtered by wallet address
 */
export async function getUsageHistory(walletAddress?: string): Promise<UsageRecord[]> {
  let history = [...mockUsageHistory];
  
  if (walletAddress) {
    history = history.filter(
      (record) => record.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  // Sort by timestamp descending
  history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return simulateTransaction(history, 500);
}

/**
 * Check if the connected network is Sepolia
 */
export function isSepoliaNetwork(chainId: number): boolean {
  return chainId === SEPOLIA_CHAIN_ID;
}

/**
 * Get Sepolia network configuration for adding to MetaMask
 */
export const SEPOLIA_NETWORK_CONFIG = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};
