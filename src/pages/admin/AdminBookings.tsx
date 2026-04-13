import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  StickyNote,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ban,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminBookings,
  useUpdateBookingStatus,
} from "@/hooks/useAdminBookings";
import type { ApiBooking, BookingStatus } from "@/lib/adminTypes";

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_TABS: { key: BookingStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "NO_SHOW", label: "Vắng mặt" },
];

const STATUS_STYLE: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-600 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  CANCELLED: "bg-red-50 text-red-500 border border-red-200",
  NO_SHOW: "bg-slate-100 text-slate-500 border border-slate-200",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Vắng mặt",
};

// Status transitions: what can each status be moved to
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function BookingRow({
  booking,
  index,
}: {
  booking: ApiBooking;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateBookingStatus();
  const start = formatDateTime(booking.startTime);
  const nextStatuses = TRANSITIONS[booking.status] ?? [];

  const handleStatus = (status: BookingStatus) => {
    updateStatus.mutate({ id: booking.id, status });
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className={`hover:bg-slate-50 transition-colors cursor-pointer ${expanded ? "bg-slate-50" : ""}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3.5 text-xs font-mono text-slate-400 whitespace-nowrap">
          #{booking.id.slice(0, 8)}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-rose-700">
                {booking.customerName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-slate-700 text-sm">
                {booking.customerName}
              </p>
              <p className="text-xs text-slate-400">{booking.customerPhone}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[160px] truncate">
          {booking.service.name}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap">
          <p className="text-sm text-slate-700">{start.date}</p>
          <p className="text-xs text-slate-400">{start.time}</p>
        </td>
        <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
          {booking.staff?.name ?? (
            <span className="italic text-slate-400">Bất kỳ</span>
          )}
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap">
          {booking.discountAmount && parseFloat(booking.discountAmount) > 0 ? (
            <div>
              <p className="text-xs text-slate-400 line-through">
                £{booking.totalPrice}
              </p>
              <p className="font-semibold text-emerald-600">
                £{booking.finalPrice}
              </p>
            </div>
          ) : (
            <p className="font-semibold text-slate-700">
              £{booking.totalPrice}
            </p>
          )}
        </td>
        <td className="px-4 py-3.5">
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLE[booking.status]}`}
          >
            {STATUS_LABEL[booking.status]}
          </span>
        </td>
        <td className="px-4 py-4">
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                disabled={updateStatus.isPending}
                title={STATUS_LABEL[s]}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${
                  s === "CONFIRMED"
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : s === "COMPLETED"
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : s === "CANCELLED"
                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {updateStatus.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : s === "CONFIRMED" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : s === "COMPLETED" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : s === "NO_SHOW" ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Ban className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="p-1.5 rounded-md bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </td>
      </motion.tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-slate-50">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Email
                  </p>
                  <p className="text-slate-700">
                    {booking.customerEmail ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Thời lượng
                  </p>
                  <p className="text-slate-700">{booking.duration} phút</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Kết thúc
                  </p>
                  <p className="text-slate-700">
                    {formatDateTime(booking.endTime).time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <StickyNote className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Ghi chú
                  </p>
                  <p className="text-slate-700">{booking.notes ?? "—"}</p>
                </div>
              </div>
            </div>
            {booking.voucherId && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                    Giá gốc
                  </p>
                  <p className="text-slate-500 line-through">
                    £{booking.totalPrice}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                    Giảm giá
                  </p>
                  <p className="text-emerald-600 font-medium">
                    -£{booking.discountAmount}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                    Giá sau giảm
                  </p>
                  <p className="text-slate-700 font-semibold">
                    £{booking.finalPrice}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                    Voucher ID
                  </p>
                  <p className="text-slate-500 font-mono text-xs">
                    {booking.voucherId}
                  </p>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const AdminBookings = () => {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading, isError, refetch, isFetching } = useAdminBookings({
    status: statusFilter,
    search: search || undefined,
    date: date || undefined,
    page,
    limit: LIMIT,
  });

  const bookings = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (key: BookingStatus | "ALL") => {
    setStatusFilter(key);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch đặt</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {meta ? `${meta.total} lịch đặt tổng cộng` : "Đang tải..."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm theo tên, SĐT, email…"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition-colors placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 transition-colors text-slate-700 shadow-sm"
        />
        {date && (
          <button
            onClick={() => {
              setDate("");
              setPage(1);
            }}
            className="px-3 py-2.5 text-xs text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            Xoá ngày
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleStatus(t.key)}
            className={`relative flex-shrink-0 px-4 py-3 text-xs font-medium transition-colors ${
              statusFilter === t.key
                ? "text-rose-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {statusFilter === t.key && (
              <motion.div
                layoutId="booking-tab"
                className="absolute bottom-0 inset-x-0 h-0.5 bg-rose-500 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-sm text-slate-400">Đang tải lịch đặt…</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <XCircle className="w-8 h-8 text-red-300" />
            <p className="text-sm text-slate-500">
              Không thể tải dữ liệu. Kiểm tra kết nối backend.
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs text-rose-500 underline"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "ID",
                    "Khách hàng",
                    "Dịch vụ",
                    "Ngày & Giờ",
                    "Nhân viên",
                    "Giá / Final",
                    "Trạng thái",
                    "Thao tác",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-14 text-center text-slate-400 text-sm"
                    >
                      Không có lịch đặt nào
                    </td>
                  </tr>
                ) : (
                  bookings.map((b, i) => (
                    <BookingRow key={b.id} booking={b} index={i} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-400 text-xs">
            Trang {meta.page} / {meta.totalPages} &nbsp;·&nbsp; {meta.total} kết
            quả
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || isFetching}
              className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
