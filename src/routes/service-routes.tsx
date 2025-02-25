
import { ServiceTypesList } from "@/components/services/ServiceTypesList"
import { RouteObject } from "react-router-dom"
import { lazy, useState } from "react"
import { ServiceStatusFilter, ServiceTypeFilter } from "@/types/service-types"

const ServiceSkills = lazy(() => import("@/pages/staff/ServiceSkills"))

const ServiceTypesListWrapper = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<ServiceTypeFilter>("all")

  return (
    <ServiceTypesList
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      typeFilter={typeFilter}
      onSearch={setSearchQuery}
      onStatusFilter={setStatusFilter}
      onTypeFilter={setTypeFilter}
    />
  )
}

export const serviceRoutes: RouteObject[] = [
  {
    path: "service-types",
    element: <ServiceTypesListWrapper />,
  },
  {
    path: "staff/service-skills",
    element: <ServiceSkills />,
  },
]
