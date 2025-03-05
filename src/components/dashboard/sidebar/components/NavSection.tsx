
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { NavSection as NavSectionType } from "../types/navigation";

interface NavSectionProps {
  section: NavSectionType;
  isCollapsed: boolean;
  onNavigate?: () => void;
  unreadCounts?: Record<string, number>;
}

export function NavSection({ section, isCollapsed, onNavigate, unreadCounts = {} }: NavSectionProps) {
  const location = useLocation();
  const { isMobile } = useSidebar();

  const getUnreadCount = (href: string) => {
    if (href === '/chat') return unreadCounts.chat || 0;
    if (href === '/notifications') return unreadCounts.notifications || 0;
    return 0;
  };

  return (
    <div className="px-3">
      {!isCollapsed && (
        <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-foreground/50">
          {section.section}
        </h4>
      )}
      <div className="space-y-1">
        {section.items.map((item) => {
          const isActive = location.pathname === item.href;
          const unreadCount = getUnreadCount(item.href);
          
          const link = (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center py-2"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0")} />
              {!isCollapsed && <span>{item.title}</span>}
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className={cn(
                    "ml-auto",
                    isCollapsed && "absolute -top-1 -right-1",
                    "text-[0.65rem] min-w-[1.2rem] h-[1.2rem] px-1"
                  )}
                >
                  {unreadCount}
                </Badge>
              )}
            </NavLink>
          );

          if (isCollapsed && !isMobile) {
            return (
              <TooltipProvider key={item.href}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    {link}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.title}
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-[0.65rem] min-w-[1.2rem] h-[1.2rem] px-1">
                        {unreadCount}
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return link;
        })}
      </div>
    </div>
  );
}
