import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BusinessSettingsDialog } from "./components/business/BusinessSettingsDialog"
import { ProfileDialog } from "./components/profile/ProfileDialog"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <BusinessSettingsDialog />
      <ProfileDialog />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App