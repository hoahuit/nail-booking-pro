import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock3,
  User,
  Mail,
  Phone,
  StickyNote,
  CheckCircle2,
  AlertCircle,
  Ban,
} from "lucide-react";
import {
  useAdminBookings,
  useUpdateBookingStatus,
} from "@/hooks/useAdminBookings";
import type { ApiBooking, BookingStatus } from "@/lib/adminTypes";

const STATUS_TABS: { key: BookingStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "NO_SHOW", label: "Vắng mặt" },
];

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Vắng mặt",
};

const STATUS_BADGE: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200",
  NO_SHOW: "bg-slate-100 text-slate-600 border border-slate-200",
};

const STATUS_EVENT: Record<BookingStatus, string> = {
  PENDING: "bg-amber-500",
  CONFIRMED: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-rose-500",
  NO_SHOW: "bg-slate-500",
};

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(input: string, months: number): string {
  const date = new Date(`${input}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return toDateInputValue(date);
}

function startOfMonth(input: string): Date {
  const date = new Date(`${input}T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthTitle(input: string): string {
  const date = new Date(`${input}T00:00:00`);
  return date.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
}

function dayTitle(input: string): string {
  return new Date(`${input}T00:00:00`).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function timeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildMonthGrid(referenceDate: string): Date[] {
  const first = startOfMonth(referenceDate);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    cells.push(cell);
  }
  return cells;
}

function dayKey(date: Date): string {
  return toDateInputValue(date);
}

const AdminBookings = () => {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "ALL">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [monthCursor, setMonthCursor] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateInputValue(new Date()),
  );

  const commonFilters = {
    status: statusFilter,
    search: search || undefined,
    page: 1,
    limit: 100,
  } as const;

  const monthQuery = useAdminBookings({ ...commonFilters });
  const dayQuery = useAdminBookings({ ...commonFilters, date: selectedDate });
  const countFilters = {
    search: search || undefined,
    page: 1,
    limit: 1,
  } as const;
  const allCountQuery = useAdminBookings({ ...countFilters, status: "ALL" });
  const pendingCountQuery = useAdminBookings({
    ...countFilters,
    status: "PENDING",
  });
  const confirmedCountQuery = useAdminBookings({
    ...countFilters,
    status: "CONFIRMED",
  });
  const completedCountQuery = useAdminBookings({
    ...countFilters,
    status: "COMPLETED",
  });
  const cancelledCountQuery = useAdminBookings({
    ...countFilters,
    status: "CANCELLED",
  });
  const noShowCountQuery = useAdminBookings({
    ...countFilters,
    status: "NO_SHOW",
  });
  const updateStatus = useUpdateBookingStatus();

  const tabCounts: Record<BookingStatus | "ALL", number> = {
    ALL: allCountQuery.data?.meta?.total ?? 0,
    PENDING: pendingCountQuery.data?.meta?.total ?? 0,
    CONFIRMED: confirmedCountQuery.data?.meta?.total ?? 0,
    COMPLETED: completedCountQuery.data?.meta?.total ?? 0,
    CANCELLED: cancelledCountQuery.data?.meta?.total ?? 0,
    NO_SHOW: noShowCountQuery.data?.meta?.total ?? 0,
  };

  const monthBookings = monthQuery.data?.data ?? [];
  const selectedDayBookings = dayQuery.data?.data ?? [];

  const currentMonthStart = startOfMonth(monthCursor);
  const currentMonth = currentMonthStart.getMonth();
  const currentYear = currentMonthStart.getFullYear();

  const monthEventsMap = useMemo(() => {
    const map = new Map<string, ApiBooking[]>();

    for (const booking of monthBookings) {
      const start = new Date(booking.startTime);
      if (
        start.getMonth() !== currentMonth ||
        start.getFullYear() !== currentYear
      ) {
        continue;
      }
      const key = toDateInputValue(start);
      const list = map.get(key) ?? [];
      list.push(booking);
      map.set(key, list);
    }

    for (const [key, list] of map.entries()) {
      map.set(
        key,
        list
          .slice()
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
          ),
      );
    }

    return map;
  }, [monthBookings, currentMonth, currentYear]);

  const gridCells = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const selectedBooking = selectedDayBookings[0] ?? null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch đặt</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Dạng lịch tháng để theo dõi booking nhanh hơn
          </p>
        </div>

        <button
          onClick={() => {
            void monthQuery.refetch();
            void dayQuery.refetch();
          }}
          disabled={monthQuery.isFetching || dayQuery.isFetching}
          className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              monthQuery.isFetching || dayQuery.isFetching ? "animate-spin" : ""
            }`}
          />
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, SĐT, email…"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition-colors placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthCursor((prev) => addMonths(prev, -1))}
              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const today = toDateInputValue(new Date());
                setMonthCursor(today);
                setSelectedDate(today);
              }}
              className="px-3.5 h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setMonthCursor((prev) => addMonths(prev, 1))}
              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center"
              aria-label="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold capitalize">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            {monthTitle(monthCursor)}
          </div>

          <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`relative flex-shrink-0 px-3 py-2 text-[11px] font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "text-rose-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label} ({tabCounts[tab.key]})
                {statusFilter === tab.key && (
                  <motion.div
                    layoutId="booking-tab"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-rose-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {monthQuery.isLoading ? (
            <div className="flex items-center justify-center py-24 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              <span className="text-sm text-slate-400">Đang tải lịch đặt…</span>
            </div>
          ) : monthQuery.isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <XCircle className="w-8 h-8 text-red-300" />
              <p className="text-sm text-slate-500">
                Không thể tải dữ liệu. Kiểm tra kết nối backend.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 border-b border-slate-200">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-[11px] font-semibold tracking-wider text-white bg-blue-600 border-r border-blue-500 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {gridCells.map((cell) => {
                  const key = dayKey(cell);
                  const events = monthEventsMap.get(key) ?? [];
                  const isCurrentMonth = cell.getMonth() === currentMonth;
                  const isSelected = key === selectedDate;
                  const isToday = key === toDateInputValue(new Date());

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(key)}
                      className={`min-h-[112px] p-1.5 border-r border-b border-slate-100 text-left align-top transition-colors ${
                        isCurrentMonth
                          ? "bg-white hover:bg-blue-50/50"
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      } ${isSelected ? "ring-2 ring-inset ring-blue-500" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold w-6 h-6 inline-flex items-center justify-center rounded-full ${
                            isToday
                              ? "bg-blue-600 text-white"
                              : "text-slate-600"
                          }`}
                        >
                          {cell.getDate()}
                        </span>
                        {events.length > 0 && (
                          <span className="text-[10px] font-medium text-slate-400">
                            {events.length}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {events.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className={`px-2 py-1 rounded text-[10px] text-white truncate ${STATUS_EVENT[booking.status]}`}
                            title={`${timeOnly(booking.startTime)} ${booking.customerName} - ${booking.service.name}`}
                          >
                            {timeOnly(booking.startTime)} {booking.customerName}
                          </div>
                        ))}
                        {events.length > 3 && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            +{events.length - 3} lịch khác
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sticky top-20">
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 capitalize">
              {dayTitle(selectedDate)}
            </p>
          </div>

          {dayQuery.isLoading ? (
            <div className="h-[220px] flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải booking trong ngày...
            </div>
          ) : selectedDayBookings.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
              <CalendarDays className="w-6 h-6" />
              <p>Không có booking trong ngày này</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {selectedDayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-slate-100 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.service.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${STATUS_BADGE[booking.status]}`}
                    >
                      {STATUS_LABEL[booking.status]}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                      {timeOnly(booking.startTime)} -{" "}
                      {timeOnly(booking.endTime)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {booking.staff?.name ?? "Chưa phân công"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {booking.customerPhone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {booking.customerEmail ?? "-"}
                    </div>
                    <div className="flex items-start gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <span>{booking.notes ?? "Không có ghi chú"}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {(TRANSITIONS[booking.status] ?? []).map((next) => (
                        <button
                          key={next}
                          onClick={() =>
                            updateStatus.mutate({
                              id: booking.id,
                              status: next,
                            })
                          }
                          disabled={updateStatus.isPending}
                          className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors disabled:opacity-50 ${STATUS_BADGE[next]}`}
                        >
                          {next === "CONFIRMED" && (
                            <CheckCircle2 className="inline w-3 h-3 mr-1" />
                          )}
                          {next === "COMPLETED" && (
                            <CheckCircle2 className="inline w-3 h-3 mr-1" />
                          )}
                          {next === "NO_SHOW" && (
                            <AlertCircle className="inline w-3 h-3 mr-1" />
                          )}
                          {next === "CANCELLED" && (
                            <Ban className="inline w-3 h-3 mr-1" />
                          )}
                          {STATUS_LABEL[next]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
