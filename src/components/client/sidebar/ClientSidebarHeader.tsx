
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function ClientSidebarHeader() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      navigate("/auth")
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out")
    }
  }

  return (
    <div className="flex h-[52px] items-center justify-between px-4 py-2">
      <Link
        to="/client"
        className="flex items-center gap-2 font-semibold"
      >
        <span className="text-lg">
          Dashboard
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full gap-2 justify-start text-muted-foreground hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
