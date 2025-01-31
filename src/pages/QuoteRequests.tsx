import { QuoteRequestList } from "@/components/quotes/QuoteRequestList"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function QuoteRequests() {
  const { isAdmin, loading } = useAdminStatus()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/")
    }
  }, [isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary/60 text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-12">
        <div className="max-w-[1600px] mx-auto">
          <QuoteRequestList />
        </div>
      </div>
    </div>
  )
}