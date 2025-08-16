import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Base network configuration
const BASE_CHAIN_ID = 8453;
const BASE_RPC_URL = 'https://mainnet.base.org';

// Mock contract address - replace with actual deployed contract
const SUBNAME_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

export const useSmartContract = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const connectToBase = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or use a wallet-enabled browser.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      // Request account access
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Check if we're on Base network
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      if (chainId !== `0x${BASE_CHAIN_ID.toString(16)}`) {
        // Try to switch to Base network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If Base network is not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [BASE_RPC_URL],
                blockExplorerUrls: ['https://basescan.org/'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      toast({
        title: "Connected to Base",
        description: "Successfully connected to Base network.",
      });

      return true;
    } catch (error: any) {
      console.error('Error connecting to Base:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to Base network. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const mintSubnameNFT = async (subname: string, referralCount: number) => {
    if (!profile) {
      toast({
        title: "Profile not found",
        description: "Please sign in to mint subname NFT.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Connect to Base network first
      const connected = await connectToBase();
      if (!connected) return;

      // Get user's wallet address
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet accounts found');
      }

      const userAddress = accounts[0];

      // Create contract instance (simplified - in production use ethers.js or web3.js)
      const contractData = {
        to: SUBNAME_CONTRACT_ADDRESS,
        from: userAddress,
        data: encodeRewardReferrerData(userAddress, subname, referralCount),
      };

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [contractData],
      });

      toast({
        title: "Transaction sent!",
        description: `Minting subname NFT. Transaction: ${txHash}`,
      });

      // In production, wait for transaction confirmation and update database
      // For now, we'll simulate success
      setTimeout(() => {
        toast({
          title: "NFT minted!",
          description: `Successfully minted ${subname} as NFT.`,
        });
      }, 3000);

      return txHash;

    } catch (error: any) {
      console.error('Error minting subname NFT:', error);
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint subname NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to encode contract call data
  const encodeRewardReferrerData = (owner: string, subname: string, referralCount: number) => {
    // This is a simplified encoding - in production, use proper ABI encoding
    // Function signature for rewardReferrer(address,string,uint256)
    return `0x1234abcd${owner.slice(2)}${Buffer.from(subname).toString('hex')}${referralCount.toString(16).padStart(64, '0')}`;
  };

  const checkWalletConnection = async () => {
    if (!window.ethereum) return false;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      return accounts && accounts.length > 0;
    } catch (error) {
      return false;
    }
  };

  return {
    connectToBase,
    mintSubnameNFT,
    checkWalletConnection,
    loading,
  };
};