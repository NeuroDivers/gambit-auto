import { lazy, Suspense } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { applyThemeClass } from "@/utils/themeUtils";

// Mock components for paths that couldn't be found
const MockComponent = () => <div>Page under construction</div>;

// Use placeholder components for missing imports
const Home = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const AdminDashboard = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const StaffDashboard = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const ClientDashboard = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Users = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const UserEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const ProfileSettings = lazy(() => import("@/pages/admin/ProfileSettings"));
const DeveloperSettings = lazy(() => import("@/pages/admin/DeveloperSettings"));
const BusinessProfile = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Customers = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const CustomerEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Estimates = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const EstimateEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Invoices = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const InvoiceEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const ServiceBays = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Services = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const ServiceEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Roles = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const RoleEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Staff = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const StaffEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Client = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const ClientEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const Vehicles = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));
const VehicleEdit = lazy(() => Promise.resolve({ default: () => <MockComponent /> }));

// Work Order Routes
import { workOrderRoutes } from "./work-order-routes";

export const protectedRoutes: RouteObject[] = [
  {
    path: "/auth",
    element: (
      <AuthGuard isPublic>
        <AuthLayout>
          <Suspense fallback={<Loading />}>
            <lazy(() => import("@/pages/Auth")) />
          </Suspense>
        </AuthLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/admin",
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "/admin/dashboard",
        element: (
          <Suspense fallback={<Loading />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: "/staff",
        element: <Navigate to="/staff/dashboard" replace />,
      },
      {
        path: "/staff/dashboard",
        element: (
          <Suspense fallback={<Loading />}>
            <StaffDashboard />
          </Suspense>
        ),
      },
      {
        path: "/client",
        element: <Navigate to="/client/dashboard" replace />,
      },
      {
        path: "/client/dashboard",
        element: (
          <Suspense fallback={<Loading />}>
            <ClientDashboard />
          </Suspense>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <Suspense fallback={<Loading />}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: "/admin/users/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <UserEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/profile-settings",
        element: (
          <Suspense fallback={<Loading />}>
            <ProfileSettings />
          </Suspense>
        ),
      },
      {
        path: "/admin/developer-settings",
        element: (
          <Suspense fallback={<Loading />}>
            <DeveloperSettings />
          </Suspense>
        ),
      },
      {
        path: "/admin/business-profile",
        element: (
          <Suspense fallback={<Loading />}>
            <BusinessProfile />
          </Suspense>
        ),
      },
      {
        path: "/admin/customers",
        element: (
          <Suspense fallback={<Loading />}>
            <Customers />
          </Suspense>
        ),
      },
      {
        path: "/admin/customers/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <CustomerEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/estimates",
        element: (
          <Suspense fallback={<Loading />}>
            <Estimates />
          </Suspense>
        ),
      },
      {
        path: "/admin/estimates/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <EstimateEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/invoices",
        element: (
          <Suspense fallback={<Loading />}>
            <Invoices />
          </Suspense>
        ),
      },
      {
        path: "/admin/invoices/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <InvoiceEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/service-bays",
        element: (
          <Suspense fallback={<Loading />}>
            <ServiceBays />
          </Suspense>
        ),
      },
      {
        path: "/admin/services",
        element: (
          <Suspense fallback={<Loading />}>
            <Services />
          </Suspense>
        ),
      },
      {
        path: "/admin/services/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <ServiceEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/roles",
        element: (
          <Suspense fallback={<Loading />}>
            <Roles />
          </Suspense>
        ),
      },
      {
        path: "/admin/roles/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <RoleEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/staff",
        element: (
          <Suspense fallback={<Loading />}>
            <Staff />
          </Suspense>
        ),
      },
      {
        path: "/admin/staff/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <StaffEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/client",
        element: (
          <Suspense fallback={<Loading />}>
            <Client />
          </Suspense>
        ),
      },
      {
        path: "/admin/client/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <ClientEdit />
          </Suspense>
        ),
      },
      {
        path: "/admin/vehicles",
        element: (
          <Suspense fallback={<Loading />}>
            <Vehicles />
          </Suspense>
        ),
      },
      {
        path: "/admin/vehicles/:id/edit",
        element: (
          <Suspense fallback={<Loading />}>
            <VehicleEdit />
          </Suspense>
        ),
      },
      ...workOrderRoutes,
    ],
  },
  {
    path: "*",
    element: <ErrorBoundary />,
  },
];
