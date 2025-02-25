
import { ServiceTypesList } from "@/components/services/ServiceTypesList"
import { RouteObject } from "react-router-dom"
import { lazy } from "react"

const ServiceSkills = lazy(() => import("@/pages/staff/ServiceSkills"))

export const serviceRoutes: RouteObject[] = [
  {
    path: "service-types",
    element: <ServiceTypesList />,
  },
  {
    path: "staff/service-skills",
    element: <ServiceSkills />,
  },
]
