
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { NavSectionProps } from "../types/navigation"

export function NavSection({ section, isCollapsed, onNavigate }: NavSectionProps) {
  const location = useLocation()

  return (
    <div className="px-3">
      {!isCollapsed && (
        <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">
          {section.section}
        </h4>
      )}
      <div className="space-y-1">
        {section.items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => onNavigate?.()}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              location.pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center py-3 px-2"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
