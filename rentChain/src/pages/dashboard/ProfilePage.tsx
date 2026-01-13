import { useEffect } from 'react';
import { authStore } from "@/store/auth.store";
import { AssociateWalletCard } from "@/components/profile/AssociateWalletCard";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import { KYCDocumentUpload } from "@/components/profile/KYCDocumentUpload";
import { ProfileUpdateForm } from "@/components/profile/ProfileUpdateForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Shield, User, FileText, Wallet } from 'lucide-react';
import { RiskBadge } from "@/components/ai/RiskBadge";
import { useRiskScore } from "@/hooks/ai";
import { useUserRole } from "@/hooks/useUserRole";

const Profile = () => {
  const { user, walletAddress, walletVerified, loadUser } = authStore();
  const { isTenant } = useUserRole();

  // AI hooks - only enable for tenants
  const { data: riskScore, isLoading: riskLoading, isError: riskError } = useRiskScore(isTenant && !!user);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdate = () => {
    // Force re-render if needed
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Please log in</h2>
            <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 ">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground text-lg">
            Manage your account information and documents
          </p>
          {isTenant && riskScore && (
            <RiskBadge
              score={riskScore.score}
              loading={riskLoading}
              error={riskError}
            />
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProfilePictureUpload
                currentPhotoUrl={user.photoUrl}
                onUpdate={handleUpdate}
              />
            </div>

            <div className="lg:col-span-2">
              <ProfileUpdateForm
                user={user}
                onUpdate={handleUpdate}
              />
            </div>
          </div>

        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KYCDocumentUpload
              documentType="recto"
              currentUrl={user.kycRectoUrl}
              onUpdate={handleUpdate}
            />

            <KYCDocumentUpload
              documentType="verso"
              currentUrl={user.kycVersoUrl}
              onUpdate={handleUpdate}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>KYC Verification Status</CardTitle>
              <CardDescription>
                Your documents will be reviewed by our team for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={user.enabled ? "default" : "secondary"}>
                  {user.enabled ? "Verified" : "Pending Verification"}
                </Badge>
                {!user.enabled && (
                  <p className="text-sm text-muted-foreground">
                    Your account will be activated once documents are verified
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <div className="max-w-2xl">
            {walletVerified && walletAddress ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Connected
                  </CardTitle>
                  <CardDescription>
                    Your MetaMask wallet is securely linked to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Wallet Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {walletAddress}
                      </code>
                      <Badge variant="default">Verified</Badge>
                    </div>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    Your wallet is used for secure authentication and blockchain interactions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AssociateWalletCard />
            )}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <ChangePasswordForm />

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email Verification</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default">Verified</Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">Not Enabled</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Security Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep your password secure and unique</li>
                  <li>• Enable two-factor authentication when available</li>
                  <li>• Regularly review your account activity</li>
                  <li>• Never share your login credentials</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;