import { useState } from 'react';
import RoleSelection from './RoleSelection';
import RegisterForm from './RegisterForm';
import VerifyEmail from './VerifyEmail';

import darkBG from "@/assets/circles-dark.png";
import lightBG from "@/assets/circles-light.png";
import { useTheme } from 'next-themes';

function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"ROLE_TENANT" | "ROLE_OWNER" | null>(null);

  const handleRoleSelect = (selectedRole: "ROLE_TENANT" | "ROLE_OWNER") => {
    setRole(selectedRole);
  };

  const handleContinue = () => {
    if (role) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };
    const handleFormSuccess = () => {
    setStep(3);
  };

  return (
    <div className="sm:min-h-screen flex gap-0 justify-between sm:flex-row flex-col p-4 sm:pt-10 pt-4">
        <img
        src={useTheme().theme === 'dark' ? darkBG : lightBG}
        alt="Background"
        className="absolute top-0 left-0 h-full object-cover -z-10"
      />
      <div className="flex flex-col items-center mb-4 sm:mb-0 sm:mr-10 text-center sm:text-left sm:items-start bg-background/40 p-8 rounded-lg backdrop-blur h-fit">
        <h1 className="text-4xl font-bold">Join RentChain</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-sm">
          Create an account to start renting or listing properties on the decentralized RentChain platform.
        </p>
      </div>
      <div className="w-full rounded-lg  sm:w-1/2">
      {step === 1 && (
        <RoleSelection
          selectedRole={role}
          onSelectRole={handleRoleSelect}
          onContinue={handleContinue}
        />
      )}
      {step === 2 && (
        <RegisterForm role={role!} onSuccess={handleFormSuccess} onBack={handleBack} />
      )}
      {step === 3 && <VerifyEmail />}

      </div>
    </div>
  );
}

export default RegisterPage;