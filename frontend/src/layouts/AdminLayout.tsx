import { Outlet, Navigate, NavLink } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { logout } from "@/features/authSlice";
import { LayoutDashboard, Users, Package, MessageCircle, LogOut, Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoadingBar from "@/components/LoadingBar";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/chat", label: "Chat", icon: MessageCircle },
];

export default function AdminLayout() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const filteredNav = navItems.filter((n) => !n.adminOnly || user.role === "admin");

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <aside className={`bg-[hsl(var(--card))] border-r flex flex-col ${className}`}>
      <div className="p-4 border-b font-bold text-lg">MERN App</div>
      <nav className="flex-1 p-2 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "hover:bg-[hsl(var(--accent))]"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen flex">
      <LoadingBar />
      <Sidebar className="hidden md:flex w-60 fixed inset-y-0" />
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <Sidebar className="relative z-50 w-60 h-full" />
        </div>
      )}
      <div className="flex-1 md:ml-60 flex flex-col">
        <header className="sticky top-0 z-30 border-b bg-[hsl(var(--background))] px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm">{user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs">Role: {user.role}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => dispatch(logout())}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
