import { Fragment, useEffect, useMemo, useState, type FormEvent } from "react";
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
  Plus,
  Pencil,
} from "lucide-react";
import {
  useAdminBookings,
  useCreateAdminBooking,
  useUpdateBookingStatus,
  useUpdateAdminBooking,
  type UpdateAdminBookingPayload,
} from "@/hooks/useAdminBookings";
import { useAdminServices } from "@/hooks/useAdminServices";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ApiBooking, BookingStatus } from "@/lib/adminTypes";
import { toast } from "sonner";

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

const STATUS_CARD: Record<BookingStatus, string> = {
  PENDING: "border-amber-300 bg-amber-50/95",
  CONFIRMED: "border-blue-300 bg-blue-50/95",
  COMPLETED: "border-emerald-300 bg-emerald-50/95",
  CANCELLED: "border-rose-300 bg-rose-50/95",
  NO_SHOW: "border-slate-300 bg-slate-100/95",
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
const STAFF_FALLBACK_LABELS = ["A", "B", "C", "D", "E", "F"];
const STAFF_COLUMN_COUNT = 3;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 23;
const SLOT_MINUTES = 15;
const SLOT_ROW_HEIGHT_PX = 60;
const WORK_START_MINUTES = WORK_START_HOUR * 60;
const WORK_END_MINUTES = WORK_END_HOUR * 60;
const SLOT_COUNT = (WORK_END_MINUTES - WORK_START_MINUTES) / SLOT_MINUTES;

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

function minutesOfDay(iso: string): number {
  const date = new Date(iso);
  return date.getHours() * 60 + date.getMinutes();
}

function formatMinutesLabel(totalMinutes: number): string {
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minute = String(totalMinutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
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

function combineDateTimeToIso(date: string, time: string): string | null {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
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
  const [quickBookingForm, setQuickBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceId: "",
    date: toDateInputValue(new Date()),
    time: "09:00",
    notes: "",
  });
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [view, setView] = useState<"calendar" | "day" | "detail">("calendar");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes: string;
    date: string;
    time: string;
  }>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
    date: "",
    time: "",
  });
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

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
  const updateBooking = useUpdateAdminBooking();
  const createBooking = useCreateAdminBooking();
  const servicesQuery = useAdminServices({
    isActive: true,
    page: 1,
    limit: 100,
  });

  const tabCounts: Record<BookingStatus | "ALL", number> = {
    ALL: allCountQuery.data?.meta?.total ?? 0,
    PENDING: pendingCountQuery.data?.meta?.total ?? 0,
    CONFIRMED: confirmedCountQuery.data?.meta?.total ?? 0,
    COMPLETED: completedCountQuery.data?.meta?.total ?? 0,
    CANCELLED: cancelledCountQuery.data?.meta?.total ?? 0,
    NO_SHOW: noShowCountQuery.data?.meta?.total ?? 0,
  };

  const monthBookings = (monthQuery.data?.data ?? []).filter(
    (b) => b.status !== "CANCELLED",
  );
  const selectedDayBookings = (dayQuery.data?.data ?? []).filter(
    (b) => b.status !== "CANCELLED",
  );
  const availableServices = servicesQuery.data?.data ?? [];

  useEffect(() => {
    setQuickBookingForm((prev) =>
      prev.date === selectedDate ? prev : { ...prev, date: selectedDate },
    );
  }, [selectedDate]);

  useEffect(() => {
    if (availableServices.length === 0) return;
    setQuickBookingForm((prev) =>
      prev.serviceId ? prev : { ...prev, serviceId: availableServices[0].id },
    );
  }, [availableServices]);

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

  const staffLaneLabels = useMemo(() => {
    const uniqueStaff = Array.from(
      new Set(
        selectedDayBookings
          .map((booking) => booking.staff?.name?.trim())
          .filter((name): name is string => Boolean(name)),
      ),
    ).slice(0, STAFF_COLUMN_COUNT);

    const lanes = uniqueStaff.slice();
    while (lanes.length < STAFF_COLUMN_COUNT) {
      lanes.push(
        STAFF_FALLBACK_LABELS[lanes.length] ?? `Thợ ${lanes.length + 1}`,
      );
    }

    return lanes;
  }, [selectedDayBookings]);

  const dayBookingColumns = useMemo(() => {
    const lanes = staffLaneLabels.map((label) => ({
      label,
      bookings: [] as ApiBooking[],
    }));
    const laneEndTime = new Array(STAFF_COLUMN_COUNT).fill(0);
    const sortedBookings = selectedDayBookings
      .slice()
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

    for (const booking of sortedBookings) {
      const start = new Date(booking.startTime).getTime();
      const end = new Date(booking.endTime).getTime();
      const preferredLane = booking.staff?.name
        ? staffLaneLabels.findIndex((label) => label === booking.staff?.name)
        : -1;

      let targetLane = -1;

      if (preferredLane >= 0 && start >= laneEndTime[preferredLane]) {
        targetLane = preferredLane;
      } else {
        targetLane = laneEndTime.findIndex((laneEnd) => start >= laneEnd);
      }

      if (targetLane < 0 && preferredLane >= 0) {
        targetLane = preferredLane;
      }

      if (targetLane < 0) {
        targetLane = laneEndTime.reduce(
          (bestIndex, laneEnd, index) =>
            laneEnd < laneEndTime[bestIndex] ? index : bestIndex,
          0,
        );
      }

      lanes[targetLane].bookings.push(booking);
      laneEndTime[targetLane] = Math.max(laneEndTime[targetLane], end);
    }

    return lanes;
  }, [selectedDayBookings, staffLaneLabels]);

  const dayTimeSlots = useMemo(
    () =>
      Array.from({ length: SLOT_COUNT }, (_, index) => {
        const minutes = WORK_START_MINUTES + index * SLOT_MINUTES;
        const minute = minutes % 60;
        const hour24 = Math.floor(minutes / 60);
        const hour12Raw = hour24 % 12;
        const hour12 = hour12Raw === 0 ? 12 : hour12Raw;

        return {
          index,
          minute,
          minuteLabel: `:${String(minute).padStart(2, "0")}`,
          isHourStart: minute === 0,
          hour24,
          hour12,
          periodLabel: hour24 < 12 ? "A.M." : "P.M.",
          bandIndex: Math.floor((minutes - WORK_START_MINUTES) / 60),
        };
      }),
    [],
  );

  const bookingPlacements = useMemo(() => {
    const placements: Array<{
      booking: ApiBooking;
      laneIndex: number;
      rowStart: number;
      rowSpan: number;
    }> = [];

    dayBookingColumns.forEach((column, laneIndex) => {
      column.bookings.forEach((booking) => {
        const start = minutesOfDay(booking.startTime);
        const end = minutesOfDay(booking.endTime);

        if (end <= WORK_START_MINUTES || start >= WORK_END_MINUTES) {
          return;
        }

        const clampedStart = Math.max(start, WORK_START_MINUTES);
        const clampedEnd = Math.min(
          end > clampedStart ? end : clampedStart + SLOT_MINUTES,
          WORK_END_MINUTES,
        );

        const startSlot = Math.floor(
          (clampedStart - WORK_START_MINUTES) / SLOT_MINUTES,
        );
        const endSlot = Math.ceil(
          (clampedEnd - WORK_START_MINUTES) / SLOT_MINUTES,
        );

        const boundedStartSlot = Math.min(
          Math.max(startSlot, 0),
          SLOT_COUNT - 1,
        );
        const boundedEndSlot = Math.min(
          Math.max(endSlot, boundedStartSlot + 1),
          SLOT_COUNT,
        );

        placements.push({
          booking,
          laneIndex,
          rowStart: boundedStartSlot + 1,
          rowSpan: 1,
        });
      });
    });

    return placements;
  }, [dayBookingColumns]);

  const timelineColumnTemplate = `72px repeat(${STAFF_COLUMN_COUNT}, minmax(0, 1fr))`;
  const timelineRowTemplate = `repeat(${SLOT_COUNT}, minmax(${SLOT_ROW_HEIGHT_PX}px, ${SLOT_ROW_HEIGHT_PX}px))`;

  const selectedBooking = useMemo(
    () =>
      selectedDayBookings.find((booking) => booking.id === selectedBookingId) ??
      null,
    [selectedBookingId, selectedDayBookings],
  );

  useEffect(() => {
    if (selectedDayBookings.length === 0) {
      setSelectedBookingId(null);
      return;
    }

    setSelectedBookingId((prev) => {
      if (prev && selectedDayBookings.some((booking) => booking.id === prev)) {
        return prev;
      }
      return selectedDayBookings[0].id;
    });
  }, [selectedDayBookings]);

  const quickFormReady = Boolean(
    quickBookingForm.customerName.trim() &&
    quickBookingForm.serviceId &&
    quickBookingForm.date &&
    quickBookingForm.time,
  );

  const openQuickCreateForDate = (date: string) => {
    setSelectedDate(date);
    setMonthCursor(date);
    setQuickBookingForm((prev) => ({ ...prev, date }));
    setIsQuickCreateOpen(true);
  };

  const openEditModal = (booking: import("@/lib/adminTypes").ApiBooking) => {
    const start = new Date(booking.startTime);
    const dateStr = toDateInputValue(start);
    const timeStr = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
    setEditingBookingId(booking.id);
    setEditForm({
      customerName: booking.customerName,
      customerPhone: booking.customerPhone ?? "",
      customerEmail: booking.customerEmail ?? "",
      notes: booking.notes ?? "",
      date: dateStr,
      time: timeStr,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingBookingId) return;
    const payload: UpdateAdminBookingPayload = { id: editingBookingId };
    if (editForm.customerName.trim())
      payload.customerName = editForm.customerName.trim();
    if (editForm.customerPhone.trim())
      payload.customerPhone = editForm.customerPhone.trim();
    payload.customerEmail = editForm.customerEmail.trim() || undefined;
    payload.notes = editForm.notes.trim() || undefined;
    if (editForm.date && editForm.time) {
      const iso = combineDateTimeToIso(editForm.date, editForm.time);
      if (iso) payload.startTime = iso;
    }
    updateBooking.mutate(payload, {
      onSuccess: () => setIsEditOpen(false),
    });
  };

  const openDayDetailModal = (date: string) => {
    setSelectedDate(date);
    setMonthCursor(date);
    setIsDayDetailModalOpen(true);
  };

  const openDayView = (date: string) => {
    setSelectedDate(date);
    setMonthCursor(date);
    setView("day");
  };

  const handleQuickBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const startTime = combineDateTimeToIso(
      quickBookingForm.date,
      quickBookingForm.time,
    );
    if (!startTime) {
      toast.error("Ngày giờ không hợp lệ");
      return;
    }

    createBooking.mutate(
      {
        serviceId: quickBookingForm.serviceId,
        startTime,
        customerName: quickBookingForm.customerName.trim(),
        customerPhone: quickBookingForm.customerPhone.trim() || undefined,
        customerEmail: quickBookingForm.customerEmail.trim() || undefined,
        notes: quickBookingForm.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelectedDate(quickBookingForm.date);
          setMonthCursor(quickBookingForm.date);
          setQuickBookingForm((prev) => ({
            ...prev,
            customerName: "",
            customerPhone: "",
            customerEmail: "",
            notes: "",
          }));
          setIsQuickCreateOpen(false);
        },
      },
    );
  };

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
      {view === "day" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("calendar")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Quay lại lịch
              </button>
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 capitalize">
                  {dayTitle(selectedDate)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo booking
            </button>
          </div>

          <div>
            {/* Timeline */}
            <div>
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
                <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                  <div
                    className="grid border-b border-slate-200"
                    style={{ gridTemplateColumns: timelineColumnTemplate }}
                  >
                    <div className="px-2 py-2 text-[11px] font-semibold text-slate-500 bg-slate-50 border-r border-slate-200">
                      Giờ
                    </div>
                    {dayBookingColumns.map((column, index) => (
                      <div
                        key={`dv-${column.label}-header-${index}`}
                        className="px-2 py-2 text-[11px] font-semibold text-slate-700 bg-slate-50 border-r border-slate-200 last:border-r-0"
                      >
                        <p>{column.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: timelineColumnTemplate,
                        gridTemplateRows: timelineRowTemplate,
                      }}
                    >
                      {dayTimeSlots.map((slot) => (
                        <Fragment key={`dv-slot-${slot.index}`}>
                          <div
                            className={`px-1.5 text-[10px] border-r border-b border-slate-200 ${
                              slot.bandIndex % 2 === 0
                                ? "bg-rose-50"
                                : "bg-white"
                            } ${slot.isHourStart ? "border-t border-slate-300" : ""}`}
                          >
                            <div className="h-full grid grid-cols-[38px_1fr] items-start pt-0.5">
                              <div className="flex flex-col items-center justify-start">
                                {slot.isHourStart && (
                                  <>
                                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full border border-slate-700 text-[12px] font-bold text-slate-800 leading-none bg-white/90">
                                      {slot.hour12}
                                    </span>
                                    <span className="mt-0.5 text-[8px] font-semibold text-slate-600 tracking-wide leading-none">
                                      {slot.periodLabel}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-600 leading-none pt-0.5">
                                {slot.minuteLabel}
                              </div>
                            </div>
                          </div>
                          {dayBookingColumns.map((_, laneIndex) => (
                            <div
                              key={`dv-slot-${slot.index}-lane-${laneIndex}`}
                              className={`border-r border-b border-slate-200 last:border-r-0 ${
                                slot.bandIndex % 2 === 0
                                  ? "bg-rose-50/65"
                                  : "bg-white"
                              } ${slot.isHourStart ? "border-t border-slate-300" : ""}`}
                            />
                          ))}
                        </Fragment>
                      ))}
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0 grid p-1"
                      style={{
                        gridTemplateColumns: timelineColumnTemplate,
                        gridTemplateRows: timelineRowTemplate,
                      }}
                    >
                      {bookingPlacements.map((placement) => {
                        const booking = placement.booking;
                        const isSelectedBooking =
                          selectedBookingId === booking.id;
                        return (
                          <div
                            key={`dv-${booking.id}`}
                            onClick={() => {
                              setSelectedBookingId(booking.id);
                              setView("detail");
                            }}
                            className={`pointer-events-auto cursor-pointer rounded-md border shadow-sm px-1.5 py-1 overflow-hidden min-h-[56px] ${STATUS_CARD[booking.status]} ${
                              isSelectedBooking ? "ring-2 ring-slate-600" : ""
                            }`}
                            style={{
                              gridColumn: placement.laneIndex + 2,
                              gridRow: `${placement.rowStart} / span ${placement.rowSpan}`,
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-slate-800 truncate">
                                  {booking.customerName}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {booking.service?.name ??
                                    booking.items
                                      ?.map((i) => i.service?.name)
                                      .filter(Boolean)
                                      .join(", ") ??
                                    ""}
                                </p>
                              </div>
                              <span
                                className={`w-4 h-4 inline-flex items-center justify-center rounded-full text-[10px] font-bold whitespace-nowrap ${STATUS_BADGE[booking.status]}`}
                              >
                                *
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className="grid"
                    style={{ gridTemplateColumns: timelineColumnTemplate }}
                  >
                    <div className="px-2 py-1.5 text-[10px] text-slate-500 border-r border-slate-200 bg-slate-50">
                      {formatMinutesLabel(WORK_END_MINUTES)}
                    </div>
                    {dayBookingColumns.map((_, index) => (
                      <div
                        key={`dv-footer-${index}`}
                        className="border-r border-slate-200 last:border-r-0 bg-slate-50"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {view === "detail" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          {/* Detail view header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <button
              onClick={() => setView("day")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Quay lại lịch ngày
            </button>
            <div className="flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700 capitalize">
                {dayTitle(selectedDate)}
              </p>
            </div>
          </div>

          {selectedBooking ? (
            <div className="p-6 max-w-2xl mx-auto space-y-5">
              {/* Name + status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedBooking.customerName}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tạo lúc{" "}
                    {new Date(selectedBooking.createdAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[selectedBooking.status]}`}
                >
                  {STATUS_LABEL[selectedBooking.status]}
                </span>
              </div>

              {/* Services */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Dịch vụ
                </p>
                <div className="rounded-lg bg-slate-50 border border-slate-200 divide-y divide-slate-200">
                  {selectedBooking.items && selectedBooking.items.length > 0 ? (
                    selectedBooking.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700">
                            {item.service?.name ?? "—"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {timeOnly(item.startTime)} –{" "}
                            {timeOnly(item.endTime)}
                            {item.staff?.name ? ` · ${item.staff.name}` : ""}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                          £{Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-slate-600">
                      {selectedBooking.service?.name ?? "—"}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Thanh toán
                </p>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tổng dịch vụ</span>
                    <span>
                      £{Number(selectedBooking.totalPrice).toFixed(2)}
                    </span>
                  </div>
                  {selectedBooking.discountAmount &&
                    Number(selectedBooking.discountAmount) > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá</span>
                        <span>
                          -£{Number(selectedBooking.discountAmount).toFixed(2)}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between text-base font-bold text-slate-800 border-t border-slate-200 pt-2 mt-1">
                    <span>Thanh toán</span>
                    <span>
                      £
                      {Number(
                        selectedBooking.finalPrice ??
                          selectedBooking.totalPrice,
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Thông tin khách
                </p>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    {selectedBooking.customerPhone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    {selectedBooking.customerEmail ?? "—"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    {selectedBooking.user?.name
                      ? `${selectedBooking.user.name} (${selectedBooking.user.email})`
                      : "Khách vãng lai"}
                  </div>
                  {selectedBooking.notes && (
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <StickyNote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{selectedBooking.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Design image */}
              {selectedBooking.designImage && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Ảnh thiết kế
                  </p>
                  <a
                    href={selectedBooking.designImage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={selectedBooking.designImage}
                      alt="Design"
                      className="max-h-80 w-auto rounded-lg border border-slate-200 bg-slate-50 hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              )}

              {/* Edit button */}
              {["PENDING", "CONFIRMED"].includes(selectedBooking.status) && (
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedBooking)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Chỉnh sửa booking
                  </button>
                </div>
              )}

              {/* Status actions */}
              {(TRANSITIONS[selectedBooking.status] ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                  {(TRANSITIONS[selectedBooking.status] ?? []).map((next) => (
                    <button
                      key={`det-${selectedBooking.id}-${next}`}
                      onClick={() =>
                        updateStatus.mutate({
                          id: selectedBooking.id,
                          status: next,
                        })
                      }
                      disabled={updateStatus.isPending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${STATUS_BADGE[next]}`}
                    >
                      {next === "CONFIRMED" && (
                        <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />
                      )}
                      {next === "COMPLETED" && (
                        <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />
                      )}
                      {next === "NO_SHOW" && (
                        <AlertCircle className="inline w-3.5 h-3.5 mr-1" />
                      )}
                      {next === "CANCELLED" && (
                        <Ban className="inline w-3.5 h-3.5 mr-1" />
                      )}
                      {STATUS_LABEL[next]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400 text-sm">
              Không tìm thấy booking.
            </div>
          )}
        </div>
      )}
      {view === "calendar" && (
        <div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {monthQuery.isLoading ? (
              <div className="flex items-center justify-center py-24 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                <span className="text-sm text-slate-400">
                  Đang tải lịch đặt…
                </span>
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
                      <div
                        key={key}
                        onClick={() => openDayView(key)}
                        onDoubleClick={() => openDayDetailModal(key)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedDate(key);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`min-h-[112px] p-1.5 border-r border-b border-slate-100 text-left align-top transition-colors ${
                          isCurrentMonth
                            ? "bg-white hover:bg-blue-50/50"
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        } ${isSelected ? "ring-2 ring-inset ring-blue-500" : ""} cursor-pointer`}
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
                          <div className="flex items-center gap-1">
                            {isCurrentMonth && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openQuickCreateForDate(key);
                                }}
                                onDoubleClick={(event) =>
                                  event.stopPropagation()
                                }
                                className="w-5 h-5 inline-flex items-center justify-center rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Tạo booking ngày này"
                                aria-label={`Tạo booking ngày ${key}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {events.length > 0 && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {events.length}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          {events.slice(0, 3).map((booking) => (
                            <div
                              key={booking.id}
                              className={`px-2 py-1 rounded text-[10px] text-white truncate ${STATUS_EVENT[booking.status]}`}
                              title={`${timeOnly(booking.startTime)} ${booking.customerName} - ${
                                booking.service?.name ??
                                booking.items
                                  ?.map((i) => i.service?.name)
                                  .filter(Boolean)
                                  .join(", ") ??
                                ""
                              }`}
                            >
                              {timeOnly(booking.startTime)}{" "}
                              {booking.customerName}
                            </div>
                          ))}
                          {events.length > 3 && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              +{events.length - 3} lịch khác
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}{" "}
      {/* end view === "calendar" */}
      <Dialog
        open={isDayDetailModalOpen}
        onOpenChange={setIsDayDetailModalOpen}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <DialogTitle className="text-base text-slate-800 capitalize">
              Chi tiết booking - {dayTitle(selectedDate)}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Popup xác nhận nhanh khi double click vào ô ngày trên lịch tháng.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 max-h-[72vh] overflow-y-auto">
            {dayQuery.isLoading || dayQuery.isFetching ? (
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
              <div className="space-y-3">
                {selectedDayBookings
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.startTime).getTime() -
                      new Date(b.startTime).getTime(),
                  )
                  .map((booking) => {
                    const transitions = TRANSITIONS[booking.status] ?? [];

                    return (
                      <div
                        key={`modal-${booking.id}`}
                        className={`rounded-lg border p-3 space-y-2.5 ${STATUS_CARD[booking.status]}`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {booking.customerName}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Tạo lúc{" "}
                              {new Date(booking.createdAt).toLocaleString(
                                "vi-VN",
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${STATUS_BADGE[booking.status]}`}
                          >
                            {STATUS_LABEL[booking.status]}
                          </span>
                        </div>

                        {/* Services list */}
                        <div className="rounded-md bg-white/70 border border-slate-200 p-2 space-y-1.5">
                          {booking.items && booking.items.length > 0 ? (
                            booking.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-700 truncate">
                                    {item.service?.name ?? "—"}
                                  </p>
                                  <p className="text-slate-400">
                                    {timeOnly(item.startTime)} –{" "}
                                    {timeOnly(item.endTime)}
                                    {item.staff?.name
                                      ? ` · ${item.staff.name}`
                                      : ""}
                                  </p>
                                </div>
                                <p className="text-slate-600 font-medium whitespace-nowrap">
                                  £{Number(item.price).toFixed(2)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-600">
                              {booking.service?.name ?? "—"}
                              {booking.staff?.name
                                ? ` · ${booking.staff.name}`
                                : ""}
                            </p>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="text-xs space-y-0.5">
                          <div className="flex justify-between text-slate-500">
                            <span>Tổng dịch vụ</span>
                            <span>
                              £{Number(booking.totalPrice).toFixed(2)}
                            </span>
                          </div>
                          {booking.discountAmount &&
                            Number(booking.discountAmount) > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Giảm giá</span>
                                <span>
                                  -£{Number(booking.discountAmount).toFixed(2)}
                                </span>
                              </div>
                            )}
                          <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-200 pt-1 mt-1">
                            <span>Thanh toán</span>
                            <span>
                              £
                              {Number(
                                booking.finalPrice ?? booking.totalPrice,
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                          <p>
                            <span className="font-medium text-slate-700">
                              SĐT:
                            </span>{" "}
                            {booking.customerPhone}
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">
                              Email:
                            </span>{" "}
                            {booking.customerEmail ?? "—"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">
                              Tài khoản:
                            </span>{" "}
                            {booking.user?.name ?? "Khách vãng lai"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-700">
                              Giờ:
                            </span>{" "}
                            {timeOnly(booking.startTime)} –{" "}
                            {timeOnly(booking.endTime)}
                          </p>
                        </div>

                        {booking.notes && (
                          <p className="text-xs text-slate-600">
                            <span className="font-medium text-slate-700">
                              Ghi chú:
                            </span>{" "}
                            {booking.notes}
                          </p>
                        )}

                        {/* Design image */}
                        {booking.designImage && (
                          <div>
                            <p className="text-[11px] font-medium text-slate-500 mb-1">
                              Ảnh thiết kế
                            </p>
                            <a
                              href={booking.designImage}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={booking.designImage}
                                alt="Design"
                                className="w-full max-h-48 object-contain rounded-md border border-slate-200 bg-white hover:opacity-90 transition-opacity"
                              />
                            </a>
                          </div>
                        )}

                        {/* Edit button in modal */}
                        {["PENDING", "CONFIRMED"].includes(booking.status) && (
                          <div className="pt-1 border-t border-slate-200/80">
                            <button
                              type="button"
                              onClick={() => {
                                setIsDayDetailModalOpen(false);
                                openEditModal(booking);
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-white bg-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                              Chỉnh sửa
                            </button>
                          </div>
                        )}

                        {/* Status actions */}
                        {transitions.length > 0 && (
                          <div className="pt-1 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                            {transitions.map((next) => (
                              <button
                                key={`modal-${booking.id}-${next}`}
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
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Booking Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-slate-800">
              Chỉnh sửa booking
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Cập nhật thông tin booking. Để trống trường không muốn thay đổi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="mt-1 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Khách hàng
              </label>
              <input
                value={editForm.customerName}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                placeholder="Tên khách hàng"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  SĐT
                </label>
                <input
                  value={editForm.customerPhone}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder="0901234567"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.customerEmail}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      customerEmail: e.target.value,
                    }))
                  }
                  placeholder="khach@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Ngày
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Giờ
                </label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Ghi chú
              </label>
              <input
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Ghi chú thêm (nếu có)"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={updateBooking.isPending}
              className="w-full px-3 py-2 text-xs font-semibold text-white bg-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updateBooking.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Quick Create Dialog */}
      <Dialog open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-slate-800">
              Tạo booking mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tạo booking cho{" "}
              <span className="capitalize">{dayTitle(selectedDate)}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickBookingSubmit} className="mt-1 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Ngày
              </label>
              <input
                type="date"
                value={quickBookingForm.date}
                onChange={(e) => {
                  setQuickBookingForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }));
                  setSelectedDate(e.target.value);
                  setMonthCursor(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Giờ *
                </label>
                <input
                  type="time"
                  step={1800}
                  value={quickBookingForm.time}
                  onChange={(e) =>
                    setQuickBookingForm((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Dịch vụ *
                </label>
                <select
                  value={quickBookingForm.serviceId}
                  onChange={(e) =>
                    setQuickBookingForm((prev) => ({
                      ...prev,
                      serviceId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                >
                  {servicesQuery.isLoading && <option>Đang tải...</option>}
                  {!servicesQuery.isLoading &&
                    availableServices.length === 0 && (
                      <option value="">Không có dịch vụ</option>
                    )}
                  {availableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Khách hàng *
              </label>
              <input
                value={quickBookingForm.customerName}
                onChange={(e) =>
                  setQuickBookingForm((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  SĐT
                </label>
                <input
                  value={quickBookingForm.customerPhone}
                  onChange={(e) =>
                    setQuickBookingForm((prev) => ({
                      ...prev,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder="0901234567"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={quickBookingForm.customerEmail}
                  onChange={(e) =>
                    setQuickBookingForm((prev) => ({
                      ...prev,
                      customerEmail: e.target.value,
                    }))
                  }
                  placeholder="khach@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Ghi chú
              </label>
              <input
                value={quickBookingForm.notes}
                onChange={(e) =>
                  setQuickBookingForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Ghi chú thêm (nếu có)"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={
                createBooking.isPending ||
                !quickFormReady ||
                servicesQuery.isLoading ||
                availableServices.length === 0
              }
              className="w-full px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createBooking.isPending ? "Đang tạo..." : "Xác nhận tạo booking"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
