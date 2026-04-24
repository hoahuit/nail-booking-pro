import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  listPublicDayOffsApi,
  listActiveVouchersApi,
  useCreateBooking,
  validateVoucherApi,
  type PublicDayOff,
  type VoucherOption,
  type VoucherValidation,
} from "@/hooks/useBooking";
import type { BookingServiceEntry, ServiceItem } from "@/lib/types";
import { useServices } from "@/hooks/useServices";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedService?: ServiceItem | null;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeSlotsByPeriod = {
  Morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  Afternoon: [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
  ],
  Evening: [
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ],
};

type Period = keyof typeof timeSlotsByPeriod;

function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const leading = first.getDay();
  const cells: (Date | null)[] = Array(leading).fill(null);

  for (let day = 1; day <= last.getDate(); day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatDisplayDate(date: Date) {
  return `${DAY_NAMES_SHORT[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseMoney(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDurationMinutes(duration: string): number {
  const hourMatch = duration.match(/(\d+)\s*h/);
  const minMatch = duration.match(/(\d+)\s*m/);
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  return hours * 60 + mins;
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function formatTotalDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const MOCK_STAFF = [
  // { id: "staff-1", name: "Staff 1" },
  // { id: "staff-2", name: "Staff 2" },
];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const BookingModal = ({
  open,
  onOpenChange,
  selectedService,
}: BookingModalProps) => {
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const [step, setStep] = useState(1);
  const [calMonth, setCalMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [period, setPeriod] = useState<Period>("Morning");

  // Multi-service entries (each has its own staff selection)
  const [serviceEntries, setServiceEntries] = useState<BookingServiceEntry[]>(
    [],
  );
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [designImage, setDesignImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [note, setNote] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValidation, setVoucherValidation] =
    useState<VoucherValidation | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<VoucherOption[]>(
    [],
  );
  const [loadingAvailableVouchers, setLoadingAvailableVouchers] =
    useState(false);
  const [dayOffs, setDayOffs] = useState<PublicDayOff[]>([]);

  const { data: serviceCategories = [] } = useServices();

  const createBooking = useCreateBooking();

  const servicePrice = useMemo(
    () =>
      serviceEntries.reduce(
        (sum, entry) => sum + parseMoney(entry.service.price),
        0,
      ),
    [serviceEntries],
  );
  const totalDurationMinutes = useMemo(
    () =>
      serviceEntries.reduce(
        (sum, entry) => sum + parseDurationMinutes(entry.service.duration),
        0,
      ),
    [serviceEntries],
  );
  const discountedPrice = voucherValidation?.finalPrice ?? servicePrice;

  const calGrid = useMemo(
    () => buildCalendarGrid(calMonth.getFullYear(), calMonth.getMonth()),
    [calMonth],
  );
  const dayOffByDate = useMemo(() => {
    return new Map(dayOffs.map((item) => [item.date, item]));
  }, [dayOffs]);

  const stepTitle =
    step === 1
      ? "New Appointment"
      : step === 2
        ? "Select Services"
        : step === 3
          ? "Your Details"
          : "Confirmed";

  // Initialise service entries when the modal opens with a pre-selected service
  useEffect(() => {
    if (open && selectedService) {
      setServiceEntries([{ service: selectedService, staffId: "any" }]);
    }
  }, [open, selectedService]);

  const navigateMonth = (direction: number) => {
    setCalMonth(
      new Date(calMonth.getFullYear(), calMonth.getMonth() + direction, 1),
    );
  };

  const goToday = () => {
    setCalMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
    setSelectedTime("");
  };

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingAvailableVouchers(true);

    listActiveVouchersApi()
      .then((items) => {
        if (cancelled) return;
        const now = Date.now();
        const filtered = items.filter((item) => {
          if (!item.isActive) return false;
          if (item.expiresAt && new Date(item.expiresAt).getTime() < now) {
            return false;
          }
          if (item.maxUses !== null && item.usedCount >= item.maxUses) {
            return false;
          }
          if (
            item.minOrderValue !== null &&
            servicePrice > 0 &&
            servicePrice < item.minOrderValue
          ) {
            return false;
          }
          return true;
        });
        setAvailableVouchers(filtered);
      })
      .catch(() => {
        if (!cancelled) setAvailableVouchers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailableVouchers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, servicePrice]);

  useEffect(() => {
    if (!open) return;

    const from = formatDateYMD(
      new Date(calMonth.getFullYear(), calMonth.getMonth(), 1),
    );
    const to = formatDateYMD(
      new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0),
    );

    let cancelled = false;

    listPublicDayOffsApi(from, to)
      .then((items) => {
        if (!cancelled) setDayOffs(items);
      })
      .catch(() => {
        if (!cancelled) setDayOffs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open, calMonth]);

  useEffect(() => {
    setVoucherValidation(null);
    setVoucherError("");
    setVoucherCode("");
  }, [selectedService?.id]);

  const applyVoucher = async (rawCode?: string): Promise<boolean> => {
    const code = (rawCode ?? voucherCode).trim().toUpperCase();
    if (!code) {
      setVoucherError("Please enter a voucher code");
      return false;
    }
    if (!servicePrice) {
      setVoucherError("Cannot validate voucher for this service");
      return false;
    }

    setIsValidatingVoucher(true);
    setVoucherError("");
    try {
      const validated = await validateVoucherApi(code, servicePrice);
      setVoucherCode(validated.code);
      setVoucherValidation(validated);
      toast.success(`Voucher ${validated.code} applied`);
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Voucher is not valid";
      setVoucherValidation(null);
      setVoucherError(message);
      return false;
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const clearVoucher = () => {
    setVoucherCode("");
    setVoucherValidation(null);
    setVoucherError("");
  };

  const handleVoucherSelect = (value: string) => {
    if (value === "NONE") {
      clearVoucher();
      return;
    }

    setVoucherCode(value);
    if (voucherValidation && voucherValidation.code !== value) {
      setVoucherValidation(null);
    }
    if (voucherError) {
      setVoucherError("");
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime("");
    setPeriod("Morning");
    setServiceEntries(
      selectedService ? [{ service: selectedService, staffId: "any" }] : [],
    );
    setShowServicePicker(false);
    setDesignImage(null);
    setNote("");
    setForm({ name: "", phone: "", email: "" });
    setVoucherCode("");
    setVoucherValidation(null);
    setVoucherError("");
    setDayOffs([]);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!form.name || !form.phone || !form.email) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!selectedDate || !selectedTime || serviceEntries.length === 0) return;

    let selectedVoucherCode: string | undefined;
    if (voucherCode.trim()) {
      const code = voucherCode.trim().toUpperCase();
      if (!voucherValidation || voucherValidation.code !== code) {
        const isValid = await applyVoucher(code);
        if (!isValid) return;
      }
      selectedVoucherCode = code;
    }

    try {
      await createBooking.mutateAsync({
        services: serviceEntries,
        date: selectedDate.toISOString(),
        time: selectedTime,
        note,
        customer: form,
        voucherCode: selectedVoucherCode,
        designImage: designImage ?? undefined,
      });
      setStep(4);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("time slot")) {
        setSelectedTime("");
        setStep(1);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (value ? onOpenChange(true) : reset())}
    >
      <DialogTitle className="sr-only">Book Appointment</DialogTitle>
      <DialogContent className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg p-0 gap-0 shadow-xl [&>button]:hidden overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm text-gray-800">Booking</span>
          </div>
          <span className="text-sm font-medium text-gray-700">{stepTitle}</span>
          <button
            onClick={reset}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Today
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <span className="font-semibold text-sm text-gray-800">
                {MONTH_NAMES[calMonth.getMonth()]} {calMonth.getFullYear()}
              </span>

              {selectedDate && selectedTime && (
                <span className="ml-auto text-xs text-blue-600 font-medium">
                  {formatDisplayDate(selectedDate)} - {selectedTime}
                </span>
              )}
            </div>

            <div className="px-4 pt-3 pb-1">
              <div className="grid grid-cols-7 mb-1">
                {DAY_HEADERS.map((header) => (
                  <div
                    key={header}
                    className="text-center text-[11px] font-semibold text-gray-400 py-1 uppercase tracking-wide"
                  >
                    {header}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-l border-t border-gray-200">
                {calGrid.map((cell, index) => {
                  if (!cell) {
                    return (
                      <div
                        key={index}
                        className="border-r border-b border-gray-200 min-h-[52px] bg-gray-50/50"
                      />
                    );
                  }

                  const isPast = cell < today;
                  const isoDate = formatDateYMD(cell);
                  const matchedDayOff = dayOffByDate.get(isoDate);
                  const isDayOff = !!matchedDayOff;
                  const isToday = cell.toDateString() === today.toDateString();
                  const isSelected =
                    selectedDate?.toDateString() === cell.toDateString();
                  const isDisabled = isPast || isDayOff;

                  return (
                    <button
                      key={index}
                      disabled={isDisabled}
                      title={
                        isDayOff
                          ? matchedDayOff.reason
                            ? `Day off: ${matchedDayOff.reason}`
                            : "Day off"
                          : undefined
                      }
                      onClick={() => {
                        setSelectedDate(cell);
                        setSelectedTime("");
                      }}
                      className={`relative border-r border-b border-gray-200 min-h-[52px] p-1.5 text-left transition-colors ${
                        isDisabled
                          ? "opacity-40 cursor-not-allowed bg-gray-50"
                          : "hover:bg-blue-50 cursor-pointer"
                      } ${isSelected ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : ""}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : isToday
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-700"
                        }`}
                      >
                        {cell.getDate()}
                      </span>
                      {isDayOff && (
                        <span className="absolute bottom-1 right-1 text-[9px] font-medium text-red-500">
                          Off
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Available Times - {formatDisplayDate(selectedDate)}
                  </p>

                  <div className="flex gap-1 bg-gray-100 rounded-full p-0.5">
                    {(Object.keys(timeSlotsByPeriod) as Period[]).map(
                      (value) => (
                        <button
                          key={value}
                          onClick={() => setPeriod(value)}
                          className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors ${
                            period === value
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {value}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {timeSlotsByPeriod[period].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 text-[11px] font-semibold rounded border transition-all ${
                        selectedTime === time
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 pb-4">
              <Button
                onClick={() => {
                  if (!selectedDate || !selectedTime) {
                    toast.error("Please select a date and time");
                    return;
                  }
                  setStep(2);
                }}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded text-xs tracking-[0.1em] uppercase py-5 font-semibold"
              >
                Next - Select Services
              </Button>
            </div>
          </div>
        )}

        {step === 2 && selectedDate && (
          <div className="flex flex-col max-h-[80vh]">
            {/* Scrollable service list */}
            <div className="overflow-y-auto px-4 py-3 space-y-3 flex-1">
              {serviceEntries.map((entry, idx) => {
                // Calculate start/end times sequentially
                let currentTime = selectedTime;
                for (let i = 0; i < idx; i++) {
                  currentTime = addMinutesToTime(
                    currentTime,
                    parseDurationMinutes(serviceEntries[i].service.duration),
                  );
                }
                const endTime = addMinutesToTime(
                  currentTime,
                  parseDurationMinutes(entry.service.duration),
                );

                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Service header */}
                    <div className="flex items-start justify-between px-4 pt-3 pb-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-800">
                          {entry.service.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {currentTime}–{endTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-800">
                          {entry.service.priceMax
                            ? `${entry.service.price} – ${entry.service.priceMax}`
                            : entry.service.price}
                        </span>
                        {serviceEntries.length > 1 && (
                          <button
                            onClick={() =>
                              setServiceEntries((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            aria-label="Remove service"
                          >
                            <X className="w-3 h-3 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Staff selection */}
                    <div className="px-3 pb-3 space-y-1.5">
                      {/* Any Staff row */}
                      <div
                        onClick={() =>
                          setServiceEntries((prev) =>
                            prev.map((e, i) =>
                              i === idx ? { ...e, staffId: "any" } : e,
                            ),
                          )
                        }
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          entry.staffId === "any"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-800">
                          Any Staff
                        </span>
                        {entry.staffId === "any" && (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      {/* Individual staff rows */}
                      {MOCK_STAFF.map((member) => (
                        <div
                          key={member.id}
                          onClick={() =>
                            setServiceEntries((prev) =>
                              prev.map((e, i) =>
                                i === idx ? { ...e, staffId: member.id } : e,
                              ),
                            )
                          }
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                            entry.staffId === member.id
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              {member.name}
                            </p>
                            <p className="text-xs text-green-600">Available</p>
                          </div>
                          {entry.staffId === member.id ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Add another service */}
              {!showServicePicker ? (
                <button
                  onClick={() => setShowServicePicker(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add another service
                </button>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Add a service
                    </span>
                    <button
                      onClick={() => setShowServicePicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                    {serviceCategories.map((cat) => (
                      <div key={cat.key}>
                        <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                          {cat.label}
                        </p>
                        {cat.items.map((svc) => (
                          <button
                            key={svc.id}
                            onClick={() => {
                              setServiceEntries((prev) => [
                                ...prev,
                                { service: svc, staffId: "any" },
                              ]);
                              setShowServicePicker(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-blue-50 transition-colors text-left"
                          >
                            <span className="text-sm text-gray-800">
                              {svc.name}
                            </span>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {svc.duration}
                              </span>
                              <span className="text-sm font-semibold text-gray-800">
                                {svc.price}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">
                  Leave a note (Optional)
                </Label>
                <Textarea
                  placeholder="Enter your note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="border-gray-200 text-sm resize-none"
                  rows={2}
                />
              </div>

              {/* Upload Design Picture */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Design Picture
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
                      toast.error(
                        "Only JPEG, PNG, WebP or GIF images are allowed",
                      );
                      return;
                    }
                    if (file.size > MAX_IMAGE_BYTES) {
                      toast.error("Image must be smaller than 5 MB");
                      return;
                    }
                    setDesignImage(file);
                  }}
                />
                {designImage ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-700 font-medium truncate max-w-[200px]">
                      {designImage.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDesignImage(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">
                    * All image types are supported
                  </p>
                )}
              </div>
            </div>

            {/* Footer: total + continue */}
            <div className="border-t border-gray-200 px-4 pt-3 pb-4 space-y-3">
              <div className="flex items-end justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back
                </button>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMoney(servicePrice)}
                  </p>
                  {totalDurationMinutes > 0 && (
                    <p className="text-xs text-gray-500">
                      {formatTotalDuration(totalDurationMinutes)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setStep(3)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-semibold py-5"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-base text-gray-800">
                Your Contact Details
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                We will send a confirmation to your contact.
              </p>
            </div>

            {serviceEntries.length > 0 && selectedDate && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm space-y-1.5">
                {serviceEntries.map((entry, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600">{entry.service.name}</span>
                    <span className="font-semibold text-gray-800">
                      {entry.service.priceMax
                        ? `${entry.service.price} – ${entry.service.priceMax}`
                        : entry.service.price}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-0.5">
                  {formatDisplayDate(selectedDate)} · {selectedTime}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Full Name *</Label>
                <Input
                  placeholder="Nguyen Van A"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="border-gray-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Phone Number *</Label>
                <Input
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="border-gray-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Email *</Label>
                <Input
                  type="email"
                  placeholder="a@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="border-gray-200 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  Voucher / Mã giảm giá (tùy chọn)
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={voucherCode || "NONE"}
                    onValueChange={handleVoucherSelect}
                    disabled={loadingAvailableVouchers}
                  >
                    <SelectTrigger className="border-gray-200 text-sm">
                      <SelectValue placeholder="Chọn voucher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">
                        Không áp dụng voucher
                      </SelectItem>
                      {availableVouchers.map((voucher) => {
                        const discountLabel =
                          voucher.type === "PERCENT"
                            ? `${voucher.value}% OFF`
                            : `${formatMoney(voucher.value)} OFF`;
                        return (
                          <SelectItem key={voucher.id} value={voucher.code}>
                            {voucher.code} • {discountLabel}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void applyVoucher();
                    }}
                    disabled={isValidatingVoucher || !voucherCode.trim()}
                    className="border-gray-200"
                  >
                    {isValidatingVoucher ? "Checking..." : "Apply"}
                  </Button>
                  {voucherValidation && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearVoucher}
                      className="border-gray-200"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {voucherError && (
                  <p className="text-xs text-red-600">{voucherError}</p>
                )}

                {voucherValidation && (
                  <p className="text-xs text-green-700">
                    Applied {voucherValidation.code}: -
                    {formatMoney(voucherValidation.discountAmount)}
                  </p>
                )}

                {loadingAvailableVouchers ? (
                  <p className="text-xs text-gray-400">Loading vouchers...</p>
                ) : (
                  availableVouchers.length === 0 && (
                    <p className="text-xs text-gray-400">
                      No voucher available for this service.
                    </p>
                  )
                )}
              </div>
            </div>

            {serviceEntries.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">
                    {formatMoney(servicePrice)}
                  </span>
                </div>
                {voucherValidation && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        Discount ({voucherValidation.code})
                      </span>
                      <span className="font-medium text-green-700">
                        -{formatMoney(voucherValidation.discountAmount)}
                      </span>
                    </div>
                    <div className="h-px bg-blue-200" />
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    Final Price
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatMoney(discountedPrice)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 rounded text-xs tracking-widest uppercase border-gray-200"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={createBooking.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs tracking-widest uppercase"
              >
                {createBooking.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <p className="font-bold text-xl text-gray-800">
                Booking Confirmed
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Thank you, {form.name}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-left space-y-2">
              {serviceEntries.map((entry, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{entry.service.name}</span>
                  <span className="font-semibold text-gray-800">
                    {entry.service.priceMax
                      ? `${entry.service.price} – ${entry.service.priceMax}`
                      : entry.service.price}
                  </span>
                </div>
              ))}
              {serviceEntries.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-800">
                    {formatMoney(servicePrice)}
                  </span>
                </div>
              )}
              {voucherValidation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Discount ({voucherValidation.code})
                  </span>
                  <span className="font-medium text-green-700">
                    -{formatMoney(voucherValidation.discountAmount)}
                  </span>
                </div>
              )}
              {serviceEntries.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Price</span>
                  <span className="font-semibold text-gray-800">
                    {formatMoney(discountedPrice)}
                  </span>
                </div>
              )}
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date and Time</span>
                  <span className="font-medium text-gray-800">
                    {formatDisplayDate(selectedDate)} · {selectedTime}
                  </span>
                </div>
              )}
              {designImage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Design image</span>
                  <span className="font-medium text-gray-800 truncate max-w-[180px]">
                    {designImage.name}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400">
              We will contact you at{" "}
              <span className="font-medium text-gray-600">{form.phone}</span> to
              confirm.
            </p>

            <Button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded text-xs tracking-widest uppercase px-10"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
