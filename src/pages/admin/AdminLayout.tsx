import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Star,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";

const navLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/bookings", icon: CalendarDays, label: "Bookings" },
  { to: "/admin/points", icon: Star, label: "Points" },
];

const SidebarContent = ({
  onClose,
  onLogout,
}: {
  onClose?: () => void;
  onLogout: () => void;
}) => (
  <>
    {/* Brand */}
    <div className="flex items-center justify-between px-6 py-6 border-b border-primary-foreground/10">
      <div>
        <span className="font-serif text-xl text-primary-foreground tracking-wide">
          LUXE NAILS
        </span>
        <p className="text-[9px] tracking-[0.25em] uppercase text-primary-foreground/30 mt-0.5">
          Admin Portal
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-primary-foreground/50 hover:text-primary-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-6 space-y-0.5">
      {navLinks.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3.5 text-[10px] tracking-[0.16em] uppercase transition-all duration-150 ${
              isActive
                ? "bg-primary-foreground/12 text-primary-foreground border-l-2 border-primary-foreground/60"
                : "text-primary-foreground/45 hover:text-primary-foreground/80 hover:bg-primary-foreground/[0.06] border-l-2 border-transparent"
            }`
          }
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>

    {/* Bottom */}
    <div className="px-3 pb-6 space-y-0.5 border-t border-primary-foreground/10 pt-4">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-3 text-[10px] tracking-[0.16em] uppercase text-primary-foreground/35 hover:text-primary-foreground/65 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        View Live Site
      </a>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] tracking-[0.16em] uppercase text-primary-foreground/35 hover:text-red-400 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  </>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    toast.info("Signed out");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[hsl(35_12%_95%)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-foreground fixed top-0 bottom-0 left-0 z-40">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-foreground flex flex-col lg:hidden">
            <SidebarContent
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-foreground border-b border-primary-foreground/10 sticky top-0 z-30">
          <span className="font-serif text-lg text-primary-foreground">
            LUXE NAILS
          </span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <Outlet />
        </main>

        <footer className="px-8 py-4 text-[10px] tracking-wider text-muted-foreground/40 uppercase text-right">
          Luxe Nails Admin · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
