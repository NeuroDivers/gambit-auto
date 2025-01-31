export type AppRole = "admin" | "manager" | "sidekick" | "client"
export type ServiceStatus = "active" | "inactive"

export interface DatabaseEnums {
  app_role: AppRole
  service_status: ServiceStatus
}