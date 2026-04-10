import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, X, CheckCircle2, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { useCreateBooking } from "@/hooks/useBooking";
import type { ServiceItem } from "@/lib/types";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedService?: ServiceItem | null;
}

const timeSlotsByPeriod = {
  Morning: ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45"],
  Afternoon: ["12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45"],
  Evening: ["16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00"],
};

type Period = keyof typeof timeSlotsByPeriod;

function getWeekDays(startDate: Date) {
  const days = [];
  const start = new Date(startDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BookingModal = ({ open, onOpenChange, selectedService }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [weekStart, setWeekStart] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [period, setPeriod] = useState<Period>("Morning");
  const [staff, setStaff] = useState("any");
  const [note, setNote] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const createBooking = useCreateBooking();

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart.toISOString()]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekLabel = `${weekDays[0].getDate().toString().padStart(2, "0")} ${monthNames[weekDays[0].getMonth()]} - ${weekDays[6].getDate().toString().padStart(2, "0")} ${monthNames[weekDays[6].getMonth()]}`;

  const navigateWeek = (dir: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dir * 7);
    setWeekStart(d);
  };

  const reset = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime("");
    setPeriod("Morning");
    setStaff("any");
    setNote("");
    setForm({ name: "", phone: "", email: "" });
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!form.name || !form.phone || !form.email) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!selectedService || !selectedDate) return;

    await createBooking.mutateAsync({
      service: selectedService,
      date: selectedDate.toISOString(),
      time: selectedTime,
      staffId: staff,
      note,
      customer: form,
    });

    setStep(4);
  };

  const formatDate = (d: Date) =>
    `${dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); else onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg bg-card border-border rounded-none p-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          {step > 1 && step < 4 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : <div />}
          <span className="font-semibold text-sm text-foreground">
            {step === 1 && selectedDate ? formatDate(selectedDate) : step === 1 ? "Select Date & Time" : step === 2 ? "Select Services" : step === 3 ? "Confirm Details" : "Confirmed"}
          </span>
          <button onClick={reset} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <button onClick={() => navigateWeek(-1)} className="p-1 hover:bg-accent rounded">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <span className="font-semibold text-sm">{weekLabel}</span>
              <button onClick={() => navigateWeek(1)} className="p-1 hover:bg-accent rounded">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex gap-1.5 justify-center">
              {weekDays.map((d, i) => {
                const isPast = d < today;
                const isSelected = selectedDate?.toDateString() === d.toDateString();
                return (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center py-2 px-3 rounded-lg text-xs transition-all ${
                      isPast ? "opacity-30 cursor-not-allowed" : isSelected ? "bg-[hsl(var(--warm))] text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    <span className="font-medium">{dayNames[i]}</span>
                    <span className="text-lg font-semibold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center border border-border rounded-full overflow-hidden">
              {(Object.keys(timeSlotsByPeriod) as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-5 py-2 text-xs font-medium transition-colors ${
                    period === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {timeSlotsByPeriod[period].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2.5 text-xs font-medium rounded-lg border transition-all ${
                    selectedTime === t
                      ? "bg-[hsl(var(--warm))] text-primary-foreground border-[hsl(var(--warm))]"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              onClick={() => {
                if (!selectedDate || !selectedTime) {
                  toast.error("Please select a date and time");
                  return;
                }
                setStep(2);
              }}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-[hsl(var(--warm))] hover:bg-[hsl(var(--warm))]/90 text-primary-foreground rounded-none py-5 text-xs tracking-[0.12em] uppercase"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Service summary + staff */}
        {step === 2 && (
          <div className="p-5 space-y-5">
            {selectedService && (
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded">
                <div>
                  <p className="font-semibold text-sm text-foreground">{selectedService.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate && formatDate(selectedDate)} · {selectedTime}
                  </p>
                </div>
                <span className="font-semibold text-foreground">{selectedService.price}</span>
              </div>
            )}

            <div className="space-y-2">
              <div
                onClick={() => setStaff("any")}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  staff === "any" ? "border-[hsl(var(--warm))] bg-[hsl(var(--warm))]/5" : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-sm">Any Staff</span>
                {staff === "any" && <CheckCircle2 className="w-5 h-5 text-[hsl(var(--warm))] ml-auto" />}
              </div>
              {["Staff 1", "Staff 2"].map((s) => (
                <div
                  key={s}
                  onClick={() => setStaff(s)}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    staff === s ? "border-[hsl(var(--warm))] bg-[hsl(var(--warm))]/5" : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{s}</p>
                    <p className="text-xs text-olive">Available</p>
                  </div>
                  {staff === s && <CheckCircle2 className="w-5 h-5 text-[hsl(var(--warm))] ml-auto" />}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Leave a note (Optional)</Label>
              <Textarea
                placeholder="Special requests..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background rounded-none border-border text-sm"
                rows={2}
              />
            </div>

            {selectedService && (
              <div className="text-right space-y-0.5">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-serif text-2xl text-foreground">{selectedService.price}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" /> {selectedService.duration}
                </p>
              </div>
            )}

            <Button
              onClick={() => setStep(3)}
              className="w-full bg-[hsl(var(--warm))] hover:bg-[hsl(var(--warm))]/90 text-primary-foreground rounded-none py-5 text-xs tracking-[0.12em] uppercase"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Personal info */}
        {step === 3 && (
          <div className="p-5 space-y-5">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">Confirm your info</h3>
              <p className="text-xs text-muted-foreground">to continue appointment booking</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="bg-background rounded-none border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-3 border border-border bg-background text-sm text-muted-foreground">
                    🇬🇧 +44
                  </div>
                  <Input
                    placeholder="7XXX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="bg-background rounded-none border-border flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="bg-background rounded-none border-border"
                />
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={createBooking.isPending}
              className="w-full bg-[hsl(var(--warm))] hover:bg-[hsl(var(--warm))]/90 text-primary-foreground rounded-none py-5 text-xs tracking-[0.12em] uppercase"
            >
              {createBooking.isPending ? "Booking..." : "Continue"}
            </Button>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="p-8 text-center space-y-5">
            <CheckCircle2 className="w-14 h-14 text-olive mx-auto" />
            <div className="space-y-1">
              <p className="font-serif text-2xl text-foreground">Thank you, {form.name}!</p>
              <p className="text-sm text-muted-foreground">Your appointment has been booked</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded space-y-1 text-sm">
              {selectedService && <p className="font-medium">{selectedService.name}</p>}
              {selectedDate && (
                <p className="text-muted-foreground">
                  {formatDate(selectedDate)} at {selectedTime}
                </p>
              )}
              <p className="text-muted-foreground">Staff: {staff === "any" ? "Any Available" : staff}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              We'll contact you at {form.phone} to confirm.
            </p>
            <Button
              onClick={reset}
              className="bg-foreground text-background rounded-none text-xs tracking-[0.12em] uppercase px-8"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
