import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import tenantImg from '@/assets/tenant.png';
import ownerImg from '@/assets/owner.png';

interface RoleSelectionProps {
  selectedRole: "ROLE_TENANT" | "ROLE_OWNER" | null;
  onSelectRole: (role: "ROLE_TENANT" | "ROLE_OWNER") => void;
  onContinue: () => void;
}

function RoleSelection({ selectedRole, onSelectRole, onContinue }: RoleSelectionProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex sm:flex-row flex-col gap-4  w-full">
        <Card
          className={`cursor-pointer gap-2 grow transition-colors border-2 ${selectedRole === 'ROLE_TENANT' ? 'border-primary bg-primary/10' : 'border-muted-200'}`}
          onClick={() => onSelectRole('ROLE_TENANT')}
        >
          <CardHeader>
            <img src={tenantImg} alt="Tenant" className="w-full h-48 object-cover mb-4  rounded-md" />
            <CardTitle className="text-xl">I am a Tenant</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            I am looking to rent a property.
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer gap-2 grow transition-colors border-2 ${selectedRole === 'ROLE_OWNER' ? 'border-primary bg-primary/10' : 'border-muted-200'}`}
          onClick={() => onSelectRole('ROLE_OWNER')}
        >
          <CardHeader>
            <img src={ownerImg} alt="Owner" className="w-full h-48 object-cover mb-4  rounded-md" />
            <CardTitle className="text-xl">I am an Owner</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            I own properties to rent out.
          </CardContent>
        </Card>
      </div>
      <Button onClick={onContinue} disabled={!selectedRole} className="w-full ">
        Continue
      </Button>
    </div>
  );
}

export default RoleSelection;