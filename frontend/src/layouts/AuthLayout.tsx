import { Outlet, Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function AuthLayout() {
  const { user } = useAppSelector((s) => s.auth);
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))]">
      <div className="w-full max-w-md p-4">
        <Outlet />
      </div>
    </div>
  );
}
