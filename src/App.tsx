import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BusinessSettingsDialog } from "./components/business/BusinessSettingsDialog"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <BusinessSettingsDialog />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App