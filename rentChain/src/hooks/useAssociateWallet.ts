import { useState } from 'react';
import { ethers } from 'ethers';
import { WalletService } from '@/services/wallet.service';
import { authStore } from '@/store/auth.store';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export const useAssociateWallet = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const associateWallet = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setWalletAddress(null);

    try {
      // Check if wallet is already associated
      const { walletVerified,walletAddress } = authStore.getState();
      if (walletVerified) {
        throw new Error('Wallet is already associated with this account');
      }

      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Tell backend what wallet to associate
      if (!walletAddress) {
        await WalletService.associateWallet(address);
      }
      
      // Generate wallet message
      const message = await WalletService.generateWalletMessage(address);
      // Sign the message
      const signature = await signer.signMessage(message);
      // Verify the signature
      await WalletService.verifyWallet({ address, signature });

      // Update the store with latest user data
      await authStore.getState().loadUser();
      
      setSuccess(true);
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 4001) {
        errorMessage = 'User rejected the signature';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { associateWallet, loading, success, error, walletAddress };
};