
import { useEffect } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { authStore } from '@/store/auth.store';
import { useWalletLogin } from '@/hooks/useWalletLogin';
import darkBG from "@/assets/circles-dark.png";
import lightBG from "@/assets/circles-light.png";
import { useTheme } from 'next-themes';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginWithWallet, loading: walletLoading, error: walletError, walletAddress } = useWalletLogin();

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (authStore.getState().isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      await authStore.getState().login(data.email, data.password);
      await authStore.getState().loadUser();
      // Navigate to home page after successful login
      navigate('/');
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Invalid email or password.');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    try {
      await loginWithWallet();
      navigate('/');
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="sm:min-h-screen flex gap-0 justify-between sm:flex-row flex-col p-4 sm:pt-10 pt-4">
      <img
        src={useTheme().theme === 'dark' ? darkBG : lightBG}
        alt="Background"
        className="absolute top-0 right-0 transform -scale-x-100 h-full object-cover -z-10"
      />
      <div className="w-full rounded-lg sm:w-1/2 flex justify-center ">
        <Card className="w-full max-w-md h-fit">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login to RentChain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(error || walletError) && (
              <Alert>
                <AlertDescription>{error || walletError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleWalletLogin}
              disabled={walletLoading}
              className="w-full"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {walletLoading ? 'Connecting...' : 'Login with MetaMask'}
            </Button>

            {walletAddress && (
              <p className="text-sm text-center text-muted-foreground">
                Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col  mb-4 sm:mb-0  text-center sm:text-left sm:items-start bg-background/40 p-8 rounded-lg backdrop-blur h-fit ">
        <h1 className="text-4xl font-bold">Welcome Back</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-sm">
          Sign in to access your RentChain account and manage your rentals.
        </p>
      </div>
    </div>
  );
}

export default Login;