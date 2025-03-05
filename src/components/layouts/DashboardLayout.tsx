
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-4">
          <ErrorBoundary>
            {children || <Outlet />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
