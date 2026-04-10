import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Star, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { mockBookings, mockCustomers } from "@/lib/mockAdminData";
import type { Booking, BookingStatus, Customer } from "@/lib/adminTypes";

const statusColors: Record<BookingStatus, string> = {
  pending:   "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

const statusLabels: Record<BookingStatus, string> = {
  pending:   "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const AdminDashboard = () => {
  const [bookings]  = useLocalStorage<Booking[]>("admin_bookings", mockBookings);
  const [customers] = useLocalStorage<Customer[]>("admin_customers", mockCustomers);
  const navigate    = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayCount = bookings.filter((b) => b.date === today).length;
    const pending    = bookings.filter((b) => b.status === "pending").length;
    const totalPts   = customers.reduce((s, c) => s + c.points, 0);
    const revenue    = bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + parseFloat(b.price.replace("£", "")), 0);
    return { todayCount, pending, totalPts, revenue };
  }, [bookings, customers, today]);

  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7);

  const statCards = [
    {
      label: "Lịch hôm nay",
      value: stats.todayCount,
      sub: `${stats.pending} chờ xác nhận`,
      icon: CalendarDays,
      iconColor: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Chờ xác nhận",
      value: stats.pending,
      sub: "cần xử lý",
      icon: TrendingUp,
      iconColor: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Tổng khách hàng",
      value: customers.length,
      sub: "đã đăng ký",
      icon: Users,
      iconColor: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Điểm lưu hành",
      value: stats.totalPts,
      sub: "toàn bộ khách",
      icon: Star,
      iconColor: "text-warm",
      bg: "bg-[hsl(35_18%_94%)]",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">Tổng quan</h1>
          <p className="mt-1 text-sm text-muted-foreground font-light">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/bookings")}
          className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-primary-foreground text-[10px] tracking-[0.2em] uppercase hover:bg-foreground/85 transition-colors"
        >
          Quản lý lịch
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card shadow-subtle p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground leading-tight max-w-[120px]">
                {s.label}
              </p>
              <div className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
            </div>
            <p className="font-serif text-4xl text-foreground leading-none">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card shadow-subtle overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-serif text-xl text-foreground">Lịch đặt gần đây</h2>
          <button
            onClick={() => navigate("/admin/bookings")}
            className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground pb-0.5 transition-all"
          >
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                {["Khách hàng", "Điện thoại", "Dịch vụ", "Ngày", "Giờ", "Trạng thái"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[10px] tracking-[0.14em] uppercase text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/bookings")}
                >
                  <td className="px-5 py-4 font-medium text-foreground whitespace-nowrap">
                    {b.customerName}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{b.phone}</td>
                  <td className="px-5 py-4 text-muted-foreground max-w-[200px] truncate">
                    {b.service}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                    {b.date}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{b.time}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border ${statusColors[b.status]}`}
                    >
                      {statusLabels[b.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
