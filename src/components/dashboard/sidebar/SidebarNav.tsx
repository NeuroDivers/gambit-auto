
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link, useLocation } from "react-router-dom"
import { SidebarNavProps } from "./types"

export function SidebarNav({ items, className }: SidebarNavProps) {
  const location = useLocation()

  return (
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
      <div className={cn("flex flex-col gap-2", className)}>
        {items.map((item) => (
          <Button
            key={item.href}
            variant={location.pathname === item.href ? "default" : "ghost"}
            className="w-full justify-start"
            asChild
          >
            <Link to={item.href}>
              {item.icon}
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
