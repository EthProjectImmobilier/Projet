// src/blockchain/provider.ts

import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

/**
 * Check if MetaMask is available
 */
export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum;
}

/**
 * Get the Ethereum provider
 */
export async function getProvider(): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  return new BrowserProvider(window.ethereum);
}

/**
 * Switch MetaMask to Sepolia network
 */
export async function switchToSepolia(): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Sepolia (chain ID: 0xaa36a7)
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
    });
  } catch (switchError: unknown) {
    // If chain doesn't exist, add it
    if (switchError instanceof Error && 'code' in switchError && switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Sepolia network to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Sepolia network');
    }
  }
}

/**
 * Get the signer (connected account)
 */
export async function getSigner(): Promise<JsonRpcSigner> {
  const provider = await getProvider();

  try {
    await provider.send('eth_requestAccounts', []);
    
    // Switch to Sepolia network
    await switchToSepolia();
    
    return await provider.getSigner();
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 4001) {
      throw new Error('User rejected the request');
    }
    throw new Error(`Failed to get signer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the current connected account
 */
export async function getAccount(): Promise<string> {
  const signer = await getSigner();
  return await signer.getAddress();
}
