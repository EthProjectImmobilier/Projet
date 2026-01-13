// src/blockchain/escrow.ts

import { Contract, ContractTransactionReceipt } from 'ethers';
import { ethers } from 'ethers';
import { getProvider, getSigner } from './provider';
import EscrowABI from './abi/Escrow.json';

const CONTRACT_ADDRESS = '0xcb12037162B776b2DDd3Cd613C50353275AaE53c';

/**
 * Get the Escrow contract instance
 */
export async function getEscrowContract(): Promise<Contract> {
  const signer = await getSigner();
  const provider = signer.provider!;

  // Verify we're on Sepolia network (chain ID: 11155111)
  const network = await provider.getNetwork();
  console.log(`Current network: ${network.name} (Chain ID: ${network.chainId})`);

  if (network.chainId !== 11155111n) {
    throw new Error(`Wrong network. You are on ${network.name}. Please switch to Sepolia network in MetaMask.`);
  }

  return new Contract(CONTRACT_ADDRESS, EscrowABI.abi, signer);
}

/**
 * Get the Escrow contract instance (read-only)
 */
export async function getEscrowContractReadOnly(): Promise<Contract> {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESS, EscrowABI.abi, provider);
}

/**
 * Pay for a booking by depositing ETH into escrow
 * @param bookingId - The booking ID
 * @param ownerAddress - The property owner's address
 * @param amountEth - Amount in ETH to deposit
 */
export async function payBooking(
  bookingId: number,
  ownerAddress: string,
  amountEth: number
): Promise<ContractTransactionReceipt> {
  const contract = await getEscrowContract();

  try {
    // Convert ETH to Wei
    const amountWei = ethers.parseEther(amountEth.toString());

    // Call deposit function with value
    const tx = await contract.deposit(bookingId, ownerAddress, {
      value: amountWei,
    });

    console.log(`Deposit transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Deposit confirmed in block: ${receipt?.blockNumber}`);

    return receipt!;
  } catch (error: unknown) {
    console.error('Failed to pay booking:', error);

    // Handle specific error types
    if (error instanceof Error && 'code' in error) {
      if (error.code === 4001) {
        throw new Error('Transaction cancelled by user');
      }

      if (error.code === -32000) {
        throw new Error('Insufficient funds');
      }

      if (error.code === -32603) {
        const message = 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
          ? error.data.message
          : error.message;
        throw new Error('Transaction reverted: ' + message);
      }
    }

    throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


/**
 * Release funds from escrow to the owner (only callable by owner)
 * @param bookingId - The booking ID
 * @param toAddress - The address to send funds to
 * @param amountWei - Amount in Wei to release
 */
export async function releaseFunds(
  bookingId: number,
  toAddress: string,
  amountWei: bigint
): Promise<ContractTransactionReceipt> {
  const contract = await getEscrowContract();

  console.log(`Release funds details:`, {
    contractAddress: CONTRACT_ADDRESS,
    bookingId,
    toAddress,
    amountWei: amountWei.toString(),
  });

  try {
    // Call releaseFunds function
    const tx = await contract.releaseFunds(bookingId, toAddress, amountWei);

    console.log(`Release funds transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Funds released in block: ${receipt?.blockNumber}`);

    return receipt!;
  } catch (error: unknown) {
    console.error('Failed to release funds:', error);

    // Handle specific error types
    if (error instanceof Error && 'code' in error) {
      if (error.code === 4001) {
        throw new Error('Transaction cancelled by user');
      }

      if (error.code === -32000) {
        throw new Error('Insufficient funds in contract');
      }

      if (error.code === -32603) {
        // Try to extract revert reason
        let revertMessage = 'Transaction reverted';
        if ('data' in error && error.data) {
          if (typeof error.data === 'string') {
            revertMessage = error.data;
          } else if (typeof error.data === 'object' && error.data && 'message' in error.data) {
            revertMessage = error.data.message as string;
          }
        } else if (error.message && error.message !== 'missing revert data') {
          revertMessage = error.message;
        }

        // Common contract revert reasons
        if (revertMessage.includes('not owner')) {
          throw new Error('Unauthorized: Only the booking owner can release funds');
        }
        if (revertMessage.includes('insufficient')) {
          throw new Error('Insufficient funds in escrow contract');
        }
        if (revertMessage.includes('zero deposit') || revertMessage.includes('zero')) {
          throw new Error('Cannot release zero amount');
        }

        throw new Error('Transaction reverted: ' + revertMessage);
      }

      if (error.code === 'CALL_EXCEPTION') {
        throw new Error('Contract call failed. Please check if you have permission to release these funds.');
      }
    }

    throw new Error(`Failed to release funds: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}