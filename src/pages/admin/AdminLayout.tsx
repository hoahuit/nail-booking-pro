import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarX2,
  Scissors,
  Star,
  Tag,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const navGroups = [
  {
    label: "Quản lý chính",
    links: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
      { to: "/admin/bookings", icon: CalendarDays, label: "Lịch đặt" },
      { to: "/admin/day-offs", icon: CalendarX2, label: "Ngày nghỉ" },
    ],
  },
  {
    label: "Cửa hàng",
    links: [
      { to: "/admin/services", icon: Scissors, label: "Dịch vụ" },
      { to: "/admin/points", icon: Star, label: "Điểm thưởng" },
      { to: "/admin/vouchers", icon: Tag, label: "Voucher" },
    ],
  },
];

const PAGE_LABELS: Record<string, string> = {
  "/admin/dashboard": "Tổng quan",
  "/admin/bookings": "Lịch đặt",
  "/admin/day-offs": "Ngày nghỉ",
  "/admin/services": "Dịch vụ",
  "/admin/points": "Điểm thưởng",
  "/admin/vouchers": "Voucher",
};

const SidebarContent = ({
  onClose,
  onLogout,
}: {
  onClose?: () => void;
  onLogout: () => void;
}) => (
  <div className="flex flex-col h-full">
    {/* Brand */}
    <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-bold">LN</span>
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm leading-tight">
            King Nails
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            Quản trị viên
          </p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-rose-50 text-rose-600"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-rose-500" : "text-slate-400"}`}
                    />
                    <span className="flex-1">{label}</span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 text-rose-400 opacity-60" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>

    {/* Bottom */}
    <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-0.5">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <ExternalLink className="w-4 h-4 text-slate-400" />
        Xem trang khách
      </a>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4 text-slate-400" />
        Đăng xuất
      </button>
    </div>
  </div>
);

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();

  const pageLabel = PAGE_LABELS[location.pathname] ?? "Quản trị";

  const handleLogout = () => {
    logout();
    toast.info("Đã đăng xuất");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 fixed top-0 bottom-0 left-0 z-40 shadow-sm">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 z-50 w-60 bg-white flex flex-col lg:hidden shadow-xl">
            <SidebarContent
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-60 flex flex-col min-h-screen w-full">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5">
            {/* Left: mobile menu + breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-1"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <span className="text-slate-400">Kings Nails</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="font-medium text-slate-700">{pageLabel}</span>
              </div>
              <span className="lg:hidden font-semibold text-slate-700">
                {pageLabel}
              </span>
            </div>

            {/* Right: search + bell + avatar */}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-5 md:p-7">
          <Outlet />
        </main>

        <footer className="px-7 py-3 text-[10px] text-slate-300 text-right border-t border-slate-100">
          Kings Nails Admin · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
