
import { useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePermissions } from "@/hooks/usePermissions"
import { useEffect, useState } from "react"
import { navigationItems } from "./config/navigationItems"
import { NavSkeleton } from "./components/NavSkeleton"
import { NavSection } from "./components/NavSection"
import { NavSection as NavSectionType } from "./types/navigation"

interface DashboardSidebarNavProps {
  onNavigate?: () => void
}

export function DashboardSidebarNav({ onNavigate }: DashboardSidebarNavProps) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { checkPermission, currentUserRole, isLoading } = usePermissions()
  const [filteredItems, setFilteredItems] = useState<NavSectionType[]>([])

  useEffect(() => {
    const filterItems = async () => {
      console.log("Current user role:", currentUserRole);
      
      if (currentUserRole?.name?.toLowerCase() === 'administrator') {
        console.log("User is admin, showing all items");
        setFilteredItems(navigationItems)
        return
      }

      const newItems = await Promise.all(navigationItems.map(async (section) => {
        const filteredSectionItems = await Promise.all(
          section.items.map(async (item) => {
            if (!item.permission) return item
            const hasPermission = await checkPermission(
              item.permission.resource,
              item.permission.type
            )
            console.log(`Checking permission for ${item.title}:`, {
              resource: item.permission.resource,
              type: item.permission.type,
              hasPermission
            });
            return hasPermission ? item : null
          })
        )
        
        return {
          ...section,
          items: filteredSectionItems.filter(Boolean)
        }
      }))
      
      setFilteredItems(newItems.filter(section => section.items.length > 0))
    }

    filterItems()
  }, [checkPermission, currentUserRole])

  if (isLoading) {
    return <NavSkeleton />
  }

  return (
    <nav className="flex flex-col gap-4 py-4">
      {filteredItems.map((section, index) => (
        <div key={section.section}>
          <NavSection
            section={section}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
          {index < filteredItems.length - 1 && !isCollapsed && (
            <Separator className="my-4" />
          )}
        </div>
      ))}
    </nav>
  )
}

