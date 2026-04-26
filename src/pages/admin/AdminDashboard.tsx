import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Users,
  TrendingUp,
  ArrowRight,
  Loader2,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAdminBookings } from "@/hooks/useAdminBookings";
import type { ApiBooking } from "@/lib/adminTypes";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Vắng mặt",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-600 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  CANCELLED: "bg-red-50 text-red-500 border border-red-200",
  NO_SHOW: "bg-slate-100 text-slate-500 border border-slate-200",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in browser local TZ

  // Fetch today's bookings + all PENDING for counts
  const {
    data: todayData,
    isLoading,
    refetch,
    isFetching,
  } = useAdminBookings({ date: today, limit: 20 });
  const { data: pendingData } = useAdminBookings({
    status: "PENDING",
    limit: 1,
  });
  const { data: allData } = useAdminBookings({ limit: 1 }); // just for total

  const todayBookings = todayData?.data ?? [];
  const pendingCount = pendingData?.meta?.total ?? 0;
  const totalCount = allData?.meta?.total ?? 0;

  const stats = useMemo(() => {
    const revenue = todayBookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((s, b) => s + parseFloat(b.totalPrice), 0);
    return { todayCount: todayData?.meta?.total ?? 0, pendingCount, revenue };
  }, [todayData, pendingCount]);

  const recent = [...todayBookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 7);

  const statCards = [
    {
      label: "Lịch hôm nay",
      value: stats.todayCount,
      sub: `${stats.pendingCount} chờ xác nhận`,
      icon: CalendarDays,
      iconColor: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Chờ xác nhận",
      value: stats.pendingCount,
      sub: "cần xử lý",
      icon: TrendingUp,
      iconColor: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Tổng lịch đặt",
      value: totalCount,
      sub: "tất cả thời gian",
      icon: Users,
      iconColor: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Doanh thu hôm nay",
      value: `£${stats.revenue.toFixed(2)}`,

      sub: "đã hoàn thành",
      icon: CalendarDays,
      iconColor: "text-warm",
      bg: "bg-[hsl(35_18%_94%)]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            Tổng quan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-light">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] border border-border tracking-[0.12em] uppercase hover:bg-secondary/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
          <button
            onClick={() => navigate("/admin/bookings")}
            className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-primary-foreground text-[10px] tracking-[0.2em] uppercase hover:bg-foreground/85 transition-colors"
          >
            Quản lý lịch
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
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
              <div
                className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}
              >
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
            </div>
            <p className="font-serif text-4xl text-foreground leading-none">
              {s.value}
            </p>
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
          <h2 className="font-serif text-xl text-foreground">Lịch hôm nay</h2>
          <button
            onClick={() => navigate("/admin/bookings")}
            className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground pb-0.5 transition-all"
          >
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-14 gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Đang tải…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  {[
                    "Khách hàng",
                    "Điện thoại",
                    "Dịch vụ",
                    "Giờ bắt đầu",
                    "Nhân viên",
                    "Trạng thái",
                  ].map((h) => (
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
                {recent.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-muted-foreground text-sm"
                    >
                      Không có lịch đặt hôm nay
                    </td>
                  </tr>
                ) : (
                  recent.map((b: ApiBooking) => {
                    const time = new Date(b.startTime).toLocaleTimeString(
                      "vi-VN",
                      { hour: "2-digit", minute: "2-digit" },
                    );
                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => navigate("/admin/bookings")}
                      >
                        <td className="px-5 py-4 font-medium text-foreground whitespace-nowrap">
                          {b.customerName}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {b.customerPhone}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground max-w-[200px] truncate">
                          {b.service?.name ??
                            b.items
                              ?.map((i) => i.service?.name)
                              .filter(Boolean)
                              .join(", ") ??
                            "—"}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                          {time}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {b.staff?.name ?? (
                            <span className="italic">Bất kỳ</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border ${statusColors[b.status]}`}
                          >
                            {STATUS_LABEL[b.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
