import { WelcomeHeader } from "./WelcomeHeader";
import { ProfileForm } from "../profile/ProfileForm";

export const DashboardLayout = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <WelcomeHeader />
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};