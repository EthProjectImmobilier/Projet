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

export const useWalletLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const loginWithWallet = async () => {
    setLoading(true);
    setError(null);
    setWalletAddress(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Generate wallet message
      const message = await WalletService.generateWalletMessage(address);

      // Sign the message
      const signature = await signer.signMessage(message);

      // Login with wallet
      await authStore.getState().loginWithWallet(address, message, signature);

      // Load user data
      await authStore.getState().loadUser();

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

  return { loginWithWallet, loading, error, walletAddress };
};