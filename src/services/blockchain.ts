/** * Blockchain Service for Digital Asset Registry DApp
 *
 * This service handles real blockchain interactions with the DigitalAssetRegistry contract
 * deployed on Sepolia Testnet (Chain ID: 11155111)
 */

import { ethers } from 'ethers';
import { Asset, AssetType, UsageRecord, TransactionResult, SEPOLIA_CHAIN_ID } from '@/types/asset';

// Replace with your actual deployed contract ABI from Remix
export const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "AccessGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "AccessRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "AssetRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "grantAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "assetType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			}
		],
		"name": "registerAsset",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "revokeAccess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "assetCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "assets",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "assetType",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "checkAccess",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "assetId",
				"type": "uint256"
			}
		],
		"name": "getAssetDetails",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "assetType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "bytes32",
						"name": "hash",
						"type": "bytes32"
					},
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "authorizedUsers",
						"type": "address[]"
					}
				],
				"internalType": "struct DigitalAssetRegistry.Asset",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyAssets",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "assetType",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "bytes32",
						"name": "hash",
						"type": "bytes32"
					},
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "authorizedUsers",
						"type": "address[]"
					}
				],
				"internalType": "struct DigitalAssetRegistry.Asset[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUsageHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "assetId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "action",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct DigitalAssetRegistry.UsageRecord[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
// Replace with your actual deployed contract address from Remix
export const CONTRACT_ADDRESS = "0x6638675940a3fDD57c2a648f32AdC5CC1f1254f0";

/**
 * Helper function to convert contract asset data to frontend Asset type
 */
function convertToAsset(contractAsset: any): Asset {
    return {
        id: contractAsset.id.toString(),
        name: contractAsset.name,
        type: contractAsset.assetType as AssetType,
        description: contractAsset.description,
        hash: contractAsset.hash,
        owner: contractAsset.owner,
        createdAt: new Date(Number(contractAsset.createdAt) * 1000),
        authorizedUsers: contractAsset.authorizedUsers
    };
}

/**
 * Helper function to convert contract usage record to frontend UsageRecord type
 */
function convertToUsageRecord(contractRecord: any, assetName: string): UsageRecord {
    return {
        id: `${contractRecord.assetId}-${contractRecord.timestamp}-${Math.random().toString(36).substring(2, 9)}`,
        assetId: contractRecord.assetId.toString(),
        assetName: assetName,
        action: contractRecord.action,
        walletAddress: contractRecord.user,
        timestamp: new Date(Number(contractRecord.timestamp) * 1000)
    };
}

/**
 * Get ethers contract instance with signer if needed
 */
async function getContract(signerNeeded = false) {
    if (!window.ethereum) {
        throw new Error('No Ethereum provider detected');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    if (signerNeeded) {
        const signer = await provider.getSigner();
        return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Register a new asset on the blockchain
 */
/**
 * Register a new asset on the blockchain
 */
/**
 * Register a new asset on the blockchain
 */
export async function registerAsset(
    name: string,
    type: AssetType,
    description: string,
    hash: string, // This comes from useFileHash and is a SHA-256 hex string
    ownerAddress: string
): Promise<TransactionResult> {
    try {
        const contract = await getContract(true);

        // The hash from useFileHash is already a proper SHA-256 hash
        // We just need to ensure it has the '0x' prefix that ethers.js expects
        let hashBytes32 = hash;
        if (!hash.startsWith('0x')) {
            hashBytes32 = '0x' + hash;
        }

        // SHA-256 produces exactly 32 bytes (64 hex chars), which is perfect for bytes32
        // No truncation needed as it's already the correct size

        // Call the contract function
        const tx = await contract.registerAsset(name, type, description, hashBytes32);

        // Wait for confirmation
        const receipt = await tx.wait();

        return {
            success: true,
            hash: receipt.hash,
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during asset registration',
        };
    }
}

/**
 * Get assets owned by or authorized to a specific wallet address
 */
/**
 * Get assets owned by or authorized to a specific wallet address
 */
export async function getMyAssets(walletAddress: string): Promise<Asset[]> {
  try {
    const contract = await getContract(true);

    // Get the contract response
    const result = await contract.getMyAssets();
    console.log("Raw result:", result);

    // The most reliable way to handle ethers.js Result objects with struct arrays
    const assets: Asset[] = [];

    // First try to get the length of the array
    let length = 0;
    try {
      length = await result.length;
      console.log("Array length:", length);
    } catch (e) {
      console.error("Couldn't get array length:", e);
      return [];
    }

    // If there are items, process each one
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        try {
          // Get each asset from the proxy
          const assetData = await result[i];
          console.log(`Asset ${i} data:`, assetData);

          // Convert the tuple to our Asset type
          // Your contract returns: [id, name, assetType, description, hash, owner, createdAt, authorizedUsers]
          const [
            id,
            name,
            assetType,
            description,
            hash,
            owner,
            createdAt,
            authorizedUsers
          ] = assetData;

          assets.push({
            id: id.toString(),
            name: name || '',
            type: (assetType as AssetType) || 'Dataset',
            description: description || '',
            hash: hash || '',
            owner: owner || '',
            createdAt: new Date(Number(createdAt.toString()) * 1000),
            authorizedUsers: authorizedUsers || []
          });
        } catch (e) {
          console.error(`Error processing asset ${i}:`, e);
        }
      }
    }

    console.log("Processed assets:", assets);
    return assets;
  } catch (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
}
/**
 * Get a single asset by ID
 */
export async function getAssetById(assetId: string): Promise<Asset | null> {
    try {
        const contract = await getContract(true);
        const contractAsset = await contract.getAssetDetails(assetId);
        return convertToAsset(contractAsset);
    } catch (error) {
        console.error('Error fetching asset by ID:', error);
        return null;
    }
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
        const contract = await getContract(true);
        const tx = await contract.transferOwnership(assetId, newOwner);
        const receipt = await tx.wait();

        return {
            success: true,
            hash: receipt.hash,
        };
    } catch (error) {
        console.error('Transfer error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during ownership transfer',
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
        const contract = await getContract(true);
        const tx = await contract.grantAccess(assetId, userAddress);
        const receipt = await tx.wait();

        return {
            success: true,
            hash: receipt.hash,
        };
    } catch (error) {
        console.error('Grant access error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error while granting access',
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
        const contract = await getContract(true);
        const tx = await contract.revokeAccess(assetId, userAddress);
        const receipt = await tx.wait();

        return {
            success: true,
            hash: receipt.hash,
        };
    } catch (error) {
        console.error('Revoke access error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error while revoking access',
        };
    }
}

/**
 * Get usage history for all assets or filtered by wallet address
 */
export async function getUsageHistory(walletAddress?: string): Promise<UsageRecord[]> {
    try {
        const contract = await getContract(true);
        let historyRecords: UsageRecord[] = [];

        if (walletAddress) {
            // Get history for specific user
            const contractRecords = await contract.getUsageHistory(walletAddress);
            
            // For each record, we need to get the asset name
            for (const record of contractRecords) {
                const asset = await contract.getAssetDetails(record.assetId);
                historyRecords.push(convertToUsageRecord(record, asset.name));
            }
        } else {
            // This would require a different approach since the contract
            // doesn't have a function to get all history
            // For now we'll just return empty array for global history
            // You might want to add a contract function for this if needed
            console.warn('Getting full usage history not implemented - consider adding a contract function for this');
        }

        // Sort by timestamp descending
        return historyRecords.sort((a, b) =>
            b.timestamp.getTime() - a.timestamp.getTime()
        );
    } catch (error) {
        console.error('Error fetching usage history:', error);
 }
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