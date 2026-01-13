import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAssociateWallet } from '@/hooks/useAssociateWallet';

export const AssociateWalletCard = () => {
  const { associateWallet, loading, success, error, walletAddress } = useAssociateWallet();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link MetaMask Wallet</CardTitle>
        <CardDescription>Associate your MetaMask wallet with your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletAddress && (
          <div>
            <p>Wallet Address: {walletAddress}</p>
            <Separator />
          </div>
        )}
        <Button onClick={associateWallet} disabled={loading}>
          {loading ? 'Linking...' : 'Link Wallet'}
        </Button>
        {success && (
          <Alert>
            <AlertDescription>Wallet successfully linked to your account</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};