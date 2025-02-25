
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <RouterProvider router={router} />
        <Toaster />
        <SonnerToaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
