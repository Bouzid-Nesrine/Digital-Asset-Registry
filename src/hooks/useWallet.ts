/**
 * useWallet Hook
 * 
 * Manages MetaMask wallet connection state and provides
 * functions for connecting, disconnecting, and switching networks.
 */

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { WalletState, SEPOLIA_CHAIN_ID } from '@/types/asset';
import { SEPOLIA_NETWORK_CONFIG } from '@/services/blockchain';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectNetwork: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  }, []);

  // Update wallet state from MetaMask
  const updateWalletState = useCallback(async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[];
      const chainId = await window.ethereum!.request({ method: 'eth_chainId' }) as string;
      const chainIdNumber = parseInt(chainId, 16);

      if (accounts.length > 0) {
        setWalletState({
          isConnected: true,
          address: accounts[0],
          chainId: chainIdNumber,
          isCorrectNetwork: chainIdNumber === SEPOLIA_CHAIN_ID,
        });
      } else {
        setWalletState({
          isConnected: false,
          address: null,
          chainId: chainIdNumber,
          isCorrectNetwork: chainIdNumber === SEPOLIA_CHAIN_ID,
        });
      }
    } catch (error) {
      console.error('Error updating wallet state:', error);
    }
  }, [isMetaMaskInstalled]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: 'MetaMask Required',
        description: 'Please install MetaMask to use this DApp.',
        variant: 'destructive',
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        await updateWalletState();
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled, updateWalletState, toast]);

  // Disconnect wallet (clear local state)
  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectNetwork: false,
    });
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  }, [toast]);

  // Switch to Sepolia network
  const switchToSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_NETWORK_CONFIG.chainId }],
      });
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask
      if ((switchError as { code?: number }).code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK_CONFIG],
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          toast({
            title: 'Network Error',
            description: 'Failed to add Sepolia network to MetaMask.',
            variant: 'destructive',
          });
        }
      } else {
        console.error('Error switching to Sepolia:', switchError);
      }
    }
  }, [isMetaMaskInstalled, toast]);

  // Get ethers provider
  const getProvider = useCallback(() => {
    if (!isMetaMaskInstalled() || !walletState.isConnected) return null;
    return new BrowserProvider(window.ethereum as unknown as import("ethers").Eip1193Provider);
  }, [isMetaMaskInstalled, walletState.isConnected]);

  // Get signer for transactions
  const getSigner = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return null;
    return provider.getSigner();
  }, [getProvider]);

  // Listen for account and network changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        disconnectWallet();
      } else {
        updateWalletState();
      }
    };

    const handleChainChanged = () => {
      updateWalletState();
    };

    window.ethereum!.on('accountsChanged', handleAccountsChanged);
    window.ethereum!.on('chainChanged', handleChainChanged);

    // Check initial state
    updateWalletState();

    return () => {
      window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum!.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, updateWalletState, disconnectWallet]);

  return {
    ...walletState,
    isConnecting,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    getProvider,
    getSigner,
  };
}
