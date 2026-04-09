import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const services = [
  "Classic Manicure",
  "Gel Polish",
  "Nail Art",
  "European Style",
  "British Classic",
  "Full Experience",
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

const BookingModal = ({ open, onOpenChange }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", phone: "", service: "", date: "", time: "", note: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.service || !form.date || !form.time) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(3);
    toast.success("Appointment booked successfully!");
  };

  const reset = () => {
    setStep(1);
    setForm({ name: "", phone: "", service: "", date: "", time: "", note: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); else onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center font-normal tracking-wide">
            {step === 3 ? "Confirmed" : "Book an Appointment"}
          </DialogTitle>
          <div className="divider-thin mt-4" />
        </DialogHeader>

        {step === 3 ? (
          <div className="text-center py-10 space-y-5">
            <CheckCircle2 className="w-12 h-12 text-olive mx-auto" />
            <p className="font-serif text-xl text-foreground">Thank you, {form.name}</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{form.service}</p>
              <p>{form.date} at {form.time}</p>
            </div>
            <p className="text-xs text-muted-foreground">We'll contact you at {form.phone} to confirm.</p>
            <Button onClick={reset} className="bg-foreground text-background rounded-none text-xs tracking-[0.15em] uppercase mt-4">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.1em] uppercase text-muted-foreground flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </Label>
                  <Input placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} className="bg-background rounded-none border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.1em] uppercase text-muted-foreground flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </Label>
                  <Input placeholder="+44 7XXX XXX XXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="bg-background rounded-none border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.1em] uppercase text-muted-foreground">Service</Label>
                  <Select value={form.service} onValueChange={(v) => update("service", v)}>
                    <SelectTrigger className="bg-background rounded-none border-border">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    if (!form.name || !form.phone || !form.service) { toast.error("Please fill in all fields"); return; }
                    setStep(2);
                  }}
                  className="w-full bg-foreground text-background rounded-none text-xs tracking-[0.15em] uppercase py-5"
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.1em] uppercase text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </Label>
                  <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="bg-background rounded-none border-border" min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.1em] uppercase text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => update("time", t)}
                        className={`py-2.5 text-xs font-medium transition-all border ${
                          form.time === t
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-foreground border-border hover:border-foreground/30"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.1em] uppercase text-muted-foreground">Notes (optional)</Label>
                  <Textarea placeholder="Special requests..." value={form.note} onChange={(e) => update("note", e.target.value)} className="bg-background rounded-none border-border" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-none text-xs tracking-[0.15em] uppercase">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-foreground text-background rounded-none text-xs tracking-[0.15em] uppercase">
                    Confirm
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
