
import { useLocation } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { supabase } from "@/integrations/supabase/client"
import { navigationItems } from "./config/navigationConfig"
import { NavigationSection } from "./types"
import { NavLink } from "./components/NavLink"

interface ClientSidebarNavProps {
  onNavigate?: () => void
}

export function ClientSidebarNav({ onNavigate }: ClientSidebarNavProps) {
  const location = useLocation()
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { checkPermission, currentUserRole } = usePermissions()
  const [filteredItems, setFilteredItems] = useState<NavigationSection[]>(navigationItems)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const filterItems = async () => {
      console.log("Filtering navigation items for role:", currentUserRole)

      if (currentUserRole?.name?.toLowerCase() === 'administrator') {
        console.log("User is admin, showing all items")
        setFilteredItems(navigationItems)
        return
      }

      const newItems = await Promise.all(
        navigationItems.map(async (section) => {
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
              })
              
              return hasPermission ? item : null
            })
          )
          
          return {
            ...section,
            items: filteredSectionItems.filter(Boolean)
          }
        })
      )
      
      setFilteredItems(newItems.filter(section => section.items.length > 0))
    }

    filterItems()
  }, [checkPermission, currentUserRole])

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    const channel = supabase
      .channel('chat_messages_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <ScrollArea className="flex-1">
      <nav className="flex flex-col gap-4 py-4">
        {filteredItems.map((section, index) => (
          <div key={section.section} className="px-3">
            {!isCollapsed && (
              <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
                {section.section}
              </h4>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink 
                  key={item.href} 
                  item={item}
                  isCollapsed={isCollapsed}
                  isMobile={isMobile}
                  unreadCount={unreadCount}
                  onNavigate={onNavigate}
                  active={location.pathname === item.href}
                />
              ))}
            </div>
            {index < filteredItems.length - 1 && !isCollapsed && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </nav>
    </ScrollArea>
  )
}
