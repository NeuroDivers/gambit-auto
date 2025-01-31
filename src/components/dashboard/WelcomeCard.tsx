import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeCardProps {
  firstName?: string | null;
  role?: string | null;
  onLogout: () => void;
}

export const WelcomeCard = ({ firstName, role, onLogout }: WelcomeCardProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-4xl font-medium text-white/90">
              Welcome, {firstName || 'Guest'}!
            </h1>
            <p className="text-base text-white/60">
              Manage your profile and settings below
            </p>
            {role && (
              <span className="text-sm text-white/40 capitalize">
                {role} account
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="gap-2 text-white/60 hover:text-white hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};