import { useEffect, useMemo, useState } from "react";
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
import type { ServiceItem } from "@/lib/types";

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
  const [staff, setStaff] = useState("any");
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

  const createBooking = useCreateBooking();
  const servicePrice = useMemo(
    () => (selectedService ? parseMoney(selectedService.price) : 0),
    [selectedService],
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
        ? "Staff and Notes"
        : step === 3
          ? "Your Details"
          : "Confirmed";

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
    setStaff("any");
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
    if (!selectedService || !selectedDate) return;

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
        service: selectedService,
        date: selectedDate.toISOString(),
        time: selectedTime,
        staffId: staff,
        note,
        customer: form,
        voucherCode: selectedVoucherCode,
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
                Next - Staff and Notes
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-5 space-y-4">
            {selectedService && selectedDate && (
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {selectedService.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {formatDisplayDate(selectedDate)} - {selectedTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {selectedService.price}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-3 h-3" /> {selectedService.duration}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Select Staff
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "any",
                  label: "Any Available Staff",
                  sub: "We will assign the best available",
                },
                { id: "staff-1", label: "Staff 1", sub: "Available" },
                { id: "staff-2", label: "Staff 2", sub: "Available" },
              ].map((member) => (
                <div
                  key={member.id}
                  onClick={() => setStaff(member.id)}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    staff === member.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {member.label}
                    </p>
                    <p className="text-xs text-green-600">{member.sub}</p>
                  </div>
                  {staff === member.id && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Notes (optional)
              </Label>
              <Textarea
                placeholder="Please prepare pastel colors"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="border-gray-200 text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 rounded text-xs tracking-widest uppercase border-gray-200"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs tracking-widest uppercase"
              >
                Next - Your Details
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

            {selectedService && selectedDate && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">{selectedService.name}</span>
                  <span className="font-semibold text-gray-800">
                    {selectedService.price}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {formatDisplayDate(selectedDate)} - {selectedTime} -{" "}
                  {staff === "any" ? "Any Staff" : staff}
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

            {selectedService && (
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
              {selectedService && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold text-gray-800">
                    {selectedService.name}
                  </span>
                </div>
              )}
              {selectedService && (
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
              {selectedService && (
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
                    {formatDisplayDate(selectedDate)} - {selectedTime}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Staff</span>
                <span className="font-medium text-gray-800">
                  {staff === "any" ? "Any Available" : staff}
                </span>
              </div>
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
