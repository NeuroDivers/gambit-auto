import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeCardProps {
  firstName?: string | null;
  onLogout: () => void;
}

export const WelcomeCard = ({ firstName, onLogout }: WelcomeCardProps) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-2xl opacity-40" />
      
      {/* Main card content */}
      <div className="relative bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Welcome{firstName ? `, ${firstName}` : ""}!
            </h1>
            <p className="text-muted-foreground/80 text-lg font-light">
              Manage your profile and settings below
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="gap-2.5 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};