
import { RouterProvider } from "react-router-dom";
import { router, AppWrapper } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWrapper>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AppWrapper>
    </QueryClientProvider>
  );
}

export default App;
