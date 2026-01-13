// src/components/bookings/PaymentComponent.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayBooking } from '@/hooks/usePayBooking';
import { isMetaMaskAvailable } from '@/blockchain/provider';

interface PaymentComponentProps {
  amount: number;
  recipientAddress: string;
  bookingId: number;
  onPaymentSuccess: () => void;
}

export const PaymentComponent: React.FC<PaymentComponentProps> = ({
  amount,
  recipientAddress,
  bookingId,
  onPaymentSuccess,
}) => {
  const { payBooking, isLoading, isSuccess, data } = usePayBooking();

  const handlePayment = async () => {
    await payBooking({ bookingId, ownerAddress: recipientAddress, amountEth: amount });
    onPaymentSuccess();
  };

  if (!isMetaMaskAvailable()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">MetaMask is required for payment.</p>
          <p className="text-sm text-muted-foreground">Please install MetaMask to proceed with payment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Total Amount:</span>
          <span className="font-semibold">{amount} ETH</span>
        </div>
        <div className="flex justify-between">
          <span>Recipient:</span>
          <span className="font-mono text-sm">{recipientAddress}</span>
        </div>

        {isSuccess && data && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 dark:text-green-200 font-semibold">Payment Successful</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Transaction: <span className="font-mono">{data.hash}</span>
            </p>
          </div>
        )}

        {!isSuccess && (
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing Payment...' : 'Pay with MetaMask'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};