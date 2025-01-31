import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeCardProps {
  email?: string | null;
  onLogout: () => void;
}

export const WelcomeCard = ({ email, onLogout }: WelcomeCardProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl blur-3xl opacity-50" />
      <div className="relative bg-card/30 backdrop-blur-sm rounded-2xl border border-white/5 p-8">
        <div className="flex justify-between items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome{email ? `, ${email}` : ""}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your profile and settings below
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="gap-2 bg-background/50 hover:bg-background/80 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};