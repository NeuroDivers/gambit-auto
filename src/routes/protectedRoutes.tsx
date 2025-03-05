import { lazy, Suspense } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { applyThemeClass } from "@/utils/themeUtils";

const Home = lazy(() => import("@/pages/Home"));
const Auth = lazy(() => import("@/pages/Auth"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const StaffDashboard = lazy(() => import("@/pages/staff/StaffDashboard"));
const ClientDashboard = lazy(() => import("@/pages/client/ClientDashboard"));
const Users = lazy(() => import("@/pages/admin/Users"));
const UserEdit = lazy(() => import("@/pages/admin/UserEdit"));
const ProfileSettings = lazy(() => import("@/pages/admin/ProfileSettings"));
const DeveloperSettings = lazy(() => import("@/pages/admin/DeveloperSettings"));
const BusinessProfile = lazy(() => import("@/pages/admin/BusinessProfile"));
const Customers = lazy(() => import("@/pages/admin/Customers"));
const CustomerEdit = lazy(() => import("@/pages/admin/CustomerEdit"));
const Estimates = lazy(() => import("@/pages/admin/Estimates"));
const EstimateEdit = lazy(() => import("@/pages/admin/EstimateEdit"));
const Invoices = lazy(() => import("@/pages/admin/Invoices"));
const InvoiceEdit = lazy(() => import("@/pages/admin/InvoiceEdit"));
const ServiceBays = lazy(() => import("@/pages/admin/ServiceBays"));
const Services = lazy(() => import("@/pages/admin/Services"));
const ServiceEdit = lazy(() => import("@/pages/admin/ServiceEdit"));
const Roles = lazy(() => import("@/pages/admin/Roles"));
const RoleEdit = lazy(() => import("@/pages/admin/RoleEdit"));
const Staff = lazy(() => import("@/pages/admin/Staff"));
const StaffEdit = lazy(() => import("@/pages/admin/StaffEdit"));
const Client = lazy(() => import("@/pages/admin/Client"));
const ClientEdit = lazy(() => import("@/pages/admin/ClientEdit"));
const Vehicles = lazy(() => import("@/pages/admin/Vehicles"));
const VehicleEdit = lazy(() => import("@/pages/admin/VehicleEdit"));

// Work Order Routes
import { workOrderRoutes } from "./work-order-routes";

export const protectedRoutes: RouteObject[] = [
  {
    path: "/auth",
    element: (
      <AuthGuard isPublic>
        <AuthLayout>
          <Suspense fallback={<Loading />}>
            <Auth />
          </Suspense>
        </AuthLayout>
      </AuthGuard>
    ),
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        {
          applyThemeClass("dark"),
          <DashboardLayout />
        }
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
