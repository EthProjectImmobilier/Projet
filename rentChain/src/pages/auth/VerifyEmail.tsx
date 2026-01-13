import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center ">
      <Card className="w-full h-fit ">
        <CardHeader>
          <CardTitle>Registration Successful</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Please check your email to verify your account.</p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmail;