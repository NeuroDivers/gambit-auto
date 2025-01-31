import { QuoteRequestList } from "@/components/quotes/QuoteRequestList"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { QuoteRequestForm } from "@/components/quotes/QuoteRequestForm"

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
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white/[0.87]">Quote Requests</h2>
                <p className="text-white/60">Manage incoming quote requests</p>
              </div>
              <QuoteRequestList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}