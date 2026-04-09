import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const services = [
  "Sơn Gel",
  "Đắp Bột & Gel",
  "Nail Art",
  "Combo VIP",
  "Chăm Sóc Tay",
  "Tháo & Làm Mới",
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

const BookingModal = ({ open, onOpenChange }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    note: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.service || !form.date || !form.time) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setStep(3);
    toast.success("Đặt lịch thành công!");
  };

  const reset = () => {
    setStep(1);
    setForm({ name: "", phone: "", service: "", date: "", time: "", note: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); else onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {step === 3 ? "Đặt Lịch Thành Công" : "Đặt Lịch Hẹn"}
          </DialogTitle>
        </DialogHeader>

        {step === 3 ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <p className="text-foreground font-serif text-xl">Cảm ơn bạn, {form.name}!</p>
            <p className="text-muted-foreground">
              Lịch hẹn: <strong>{form.service}</strong><br />
              {form.date} lúc {form.time}
            </p>
            <p className="text-sm text-muted-foreground">Chúng tôi sẽ liên hệ qua số {form.phone} để xác nhận.</p>
            <Button onClick={reset} className="bg-gradient-rose mt-4">Đóng</Button>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground"><User className="w-4 h-4 text-primary" />Họ và tên</Label>
                  <Input placeholder="Nhập họ và tên" value={form.name} onChange={(e) => update("name", e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground"><Phone className="w-4 h-4 text-primary" />Số điện thoại</Label>
                  <Input placeholder="0912 345 678" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground"><Sparkles className="w-4 h-4 text-primary" />Dịch vụ</Label>
                  <Select value={form.service} onValueChange={(v) => update("service", v)}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Chọn dịch vụ" /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => {
                  if (!form.name || !form.phone || !form.service) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
                  setStep(2);
                }} className="w-full bg-gradient-rose">
                  Tiếp Theo
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground"><Calendar className="w-4 h-4 text-primary" />Ngày hẹn</Label>
                  <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="bg-background" min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground"><Clock className="w-4 h-4 text-primary" />Giờ hẹn</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        onClick={() => update("time", t)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                          form.time === t
                            ? "bg-gradient-rose text-primary-foreground border-primary shadow-rose"
                            : "bg-background text-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Ghi chú (tùy chọn)</Label>
                  <Textarea placeholder="Yêu cầu đặc biệt..." value={form.note} onChange={(e) => update("note", e.target.value)} className="bg-background" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Quay Lại</Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-gradient-rose">Xác Nhận Đặt Lịch</Button>
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
