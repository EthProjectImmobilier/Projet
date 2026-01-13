// src/hooks/usePayBooking.ts

import { useState } from 'react';
import { payBooking } from '@/blockchain/escrow';
import { toast } from 'sonner';
import { ContractTransactionReceipt } from 'ethers';

export const usePayBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [data, setData] = useState<ContractTransactionReceipt | null>(null);

  const payBookingMutation = async ({
    bookingId,
    ownerAddress,
    amountEth,
  }: {
    bookingId: number;
    ownerAddress: string;
    amountEth: number;
  }) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setData(null);

    try {
      const receipt = await payBooking(bookingId, ownerAddress, amountEth);
      setData(receipt);
      setIsSuccess(true);
      toast.success(`Payment successful! Transaction: ${receipt.hash}`);
      return receipt;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Payment failed');
      setError(error);
      if (error.message.includes('cancelled') || error.message.includes('rejected')) {
        toast.error('Transaction cancelled');
      } else if (error.message.includes('insufficient')) {
        toast.error('Insufficient ETH balance');
      } else {
        toast.error(`Payment failed: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payBooking: payBookingMutation,
    isLoading,
    error,
    isSuccess,
    data,
  };
};