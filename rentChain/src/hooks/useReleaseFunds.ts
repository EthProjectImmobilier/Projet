// src/hooks/useReleaseFunds.ts

import { useState } from 'react';
import { releaseFunds } from '@/blockchain/escrow';
import { toast } from 'sonner';
import { ContractTransactionReceipt } from 'ethers';

export const useReleaseFunds = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [data, setData] = useState<ContractTransactionReceipt | null>(null);

  const releaseFundsMutation = async ({
    bookingId,
    toAddress,
    amountWei,
  }: {
    bookingId: number;
    toAddress: string;
    amountWei: bigint;
  }) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setData(null);

    try {
      const receipt = await releaseFunds(bookingId, toAddress, amountWei);
      setData(receipt);
      setIsSuccess(true);
      toast.success(`Funds released successfully! Transaction: ${receipt.hash}`);
      return receipt;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to release funds');
      setError(error);
      if (error.message.includes('cancelled') || error.message.includes('rejected')) {
        toast.error('Transaction cancelled');
      } else if (error.message.includes('insufficient')) {
        toast.error('Insufficient funds in contract');
      } else {
        toast.error(`Failed to release funds: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    releaseFunds: releaseFundsMutation,
    isLoading,
    error,
    isSuccess,
    data,
  };
};