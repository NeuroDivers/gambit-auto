
import { createBrowserRouter } from "react-router-dom"
import Auth from "@/pages/Auth"
import UserDetails from "./pages/UserDetails"
import ResetPassword from "./pages/ResetPassword"
import NotFound from "./pages/NotFound"
import Unauthorized from "./pages/Unauthorized"
import PublicInvoiceView from "./pages/PublicInvoiceView"
import { protectedRoutes } from "./routes/protectedRoutes"
import ClearAuth from "./pages/ClearAuth"
import ChatClear from "./pages/ChatClear"

// Create the router
export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/user",
    element: <UserDetails />
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/p/:invoiceId",
    element: <PublicInvoiceView />
  },
  {
    path: "/clear-auth",
    element: <ClearAuth />
  },
  {
    path: "/clear-chat",
    element: <ChatClear />
  },
  protectedRoutes, // This contains the Dashboard route
  {
    path: "*",
    element: <NotFound />
  }
])
