import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Dashboard from "@/pages/dashboard/Dashboard";
import UsersPage from "@/pages/users/UsersPage";
import ProductsPage from "@/pages/products/ProductsPage";
import ChatPage from "@/pages/chat/ChatPage";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
    ],
  },
  {
    element: <AdminLayout />,
    handle: { crumb: "Home" },
    children: [
      { path: "/dashboard", element: <Dashboard />, handle: { crumb: "Dashboard" } },
      { path: "/users", element: <UsersPage />, handle: { crumb: "Users" } },
      { path: "/products", element: <ProductsPage />, handle: { crumb: "Products" } },
      { path: "/chat", element: <ChatPage />, handle: { crumb: "Chat" } },
    ],
  },
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);

export default router;
