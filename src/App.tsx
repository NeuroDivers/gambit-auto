import { RouterProvider } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { router } from "./router"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}