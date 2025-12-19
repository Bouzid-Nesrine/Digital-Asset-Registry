// Digital Asset Registry - Type Definitions

export type AssetType = 'Dataset' | 'Model' | 'Code' | 'Research Paper';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  hash: string;
  owner: string;
  createdAt: Date;
  authorizedUsers: string[];
}

export type ActionType = 'registered' | 'accessed' | 'transferred' | 'access_granted' | 'access_revoked';

export interface UsageRecord {
  id: string;
  assetId: string;
  assetName: string;
  action: ActionType;
  walletAddress: string;
  timestamp: Date;
  details?: string;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
}

// Sepolia testnet chain ID
export const SEPOLIA_CHAIN_ID = 11155111;
