import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const routeNames: Record<string, string> = {
  "user-management": "User Management",
  "work-orders": "Work Orders",
  "auth": "Authentication",
  "invoices": "Invoices",
  "edit": "Edit Work Order",
  "service-types": "Service Types",
  "service-bays": "Service Bays",
};

export function PageBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (location.pathname === "/") return null;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          // Skip ID segments in the breadcrumb
          if (segment.match(/^[0-9a-fA-F-]{36}$/)) return null;
          
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1 || 
            (index === pathSegments.length - 2 && pathSegments[index + 1] === "edit");

          return (
            <BreadcrumbItem key={path}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{routeNames[segment] || segment}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={path}>{routeNames[segment] || segment}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}