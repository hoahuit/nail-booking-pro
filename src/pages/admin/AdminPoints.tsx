import { useState } from "react";
import { Search, Star, Plus, Minus, Phone, User, Award, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { mockCustomers, mockTransactions } from "@/lib/mockAdminData";
import type { Customer, PointTransaction } from "@/lib/adminTypes";

const REDEMPTION_THRESHOLD = 100;
const POINTS_VALUE = 5; // £5 per 100 pts

const AdminPoints = () => {
  const [customers,    setCustomers]    = useLocalStorage<Customer[]>("admin_customers", mockCustomers);
  const [transactions, setTransactions] = useLocalStorage<PointTransaction[]>("admin_transactions", mockTransactions);

  const [phone,        setPhone]        = useState("");
  const [searched,     setSearched]     = useState(false);
  const [found,        setFound]        = useState<Customer | null>(null);
  const [adjustDelta,  setAdjustDelta]  = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustNote,   setAdjustNote]   = useState("");

  const doSearch = () => {
    const c = customers.find(
      (c) => c.phone.replace(/\s/g, "") === phone.replace(/\s/g, "")
    );
    setSearched(true);
    setFound(c ?? null);
  };

  const applyTransaction = (delta: number, reason: string, adminNote?: string) => {
    if (!found) return;
    const tx: PointTransaction = {
      id: `t${Date.now()}`,
      customerId: found.id,
      customerName: found.name,
      phone: found.phone,
      delta,
      reason,
      adminNote,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
    const newPts = Math.max(0, found.points + delta);
    setCustomers((prev) =>
      prev.map((c) => (c.id === found.id ? { ...c, points: newPts } : c))
    );
    setFound((prev) => (prev ? { ...prev, points: newPts } : null));
  };

  const handleAdjust = (type: "add" | "deduct") => {
    const val = parseInt(adjustDelta);
    if (!val || val <= 0) { toast.error("Vui lòng nhập số điểm hợp lệ"); return; }
    if (!adjustReason.trim()) { toast.error("Lý do là bắt buộc"); return; }
    const delta = type === "add" ? val : -val;
    applyTransaction(delta, adjustReason.trim(), adjustNote.trim() || undefined);
    toast.success(
      `${type === "add" ? "+" : "-"}${val} điểm đã ${type === "add" ? "cộng cho" : "trừ của"} ${found!.name}`
    );
    setAdjustDelta("");
    setAdjustReason("");
    setAdjustNote("");
  };

  const handleRedeem = () => {
    if (!found || found.points < REDEMPTION_THRESHOLD) {
      toast.error(`Cần tối thiểu ${REDEMPTION_THRESHOLD} điểm để đổi thưởng`);
      return;
    }
    applyTransaction(
      -REDEMPTION_THRESHOLD,
      `Đổi ${REDEMPTION_THRESHOLD} điểm — giảm £${POINTS_VALUE}`
    );
    toast.success(`Giảm £${POINTS_VALUE} đã áp dụng cho ${found.name}`);
  };

  const customerTxs = transactions.filter((t) => found && t.phone === found.phone);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Quản lý điểm</h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          Tra cứu khách hàng theo số điện thoại để xem và quản lý điểm tích lũy
        </p>
      </div>

      {/* Rules strip */}
      <div
        className="bg-card border-l-[3px] px-6 py-4 flex flex-wrap gap-8 shadow-subtle"
        style={{ borderColor: "hsl(var(--warm))" }}
      >
        {[
          { label: "Điểm mỗi lịch đặt",      value: "10 điểm" },
          { label: "Mức đổi thưởng",           value: "100 điểm = £5 giảm giá" },
          { label: "Điểm không hết hạn",        value: "✓" },
        ].map((r) => (
          <div key={r.label}>
            <p className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground">{r.label}</p>
            <p className="mt-0.5 font-serif text-xl text-foreground">{r.value}</p>
          </div>
        ))}
      </div>

      {/* Phone search card */}
      <div className="bg-card shadow-subtle p-6 space-y-5">
        <h2 className="font-serif text-xl text-foreground flex items-center gap-2.5">
          <Phone className="w-4 h-4" style={{ color: "hsl(var(--warm))" }} />
          Tra cứu khách hàng
        </h2>

        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSearched(false); setFound(null); }}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Số điện thoại  (vd: 07700900002)"
              className="w-full pl-11 pr-4 py-3 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
            />
          </div>
          <button
            onClick={doSearch}
            disabled={!phone.trim()}
            className="px-7 py-3 bg-foreground text-primary-foreground text-[10px] tracking-[0.2em] uppercase disabled:opacity-35 hover:bg-foreground/85 transition-colors flex-shrink-0"
          >
            Tìm kiếm
          </button>
        </div>

        <AnimatePresence>
          {searched && !found && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              Không tìm thấy khách hàng với số điện thoại này.
            </motion.p>
          )}

          {found && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-2"
            >
              {/* Customer card */}
              <div className="border border-border p-5 flex flex-wrap gap-5">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-[150px] space-y-0.5">
                  <p className="font-serif text-2xl text-foreground">{found.name}</p>
                  <p className="text-sm text-muted-foreground">{found.phone}</p>
                  <p className="text-sm text-muted-foreground">{found.email}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Thành viên từ{" "}
                    {new Date(found.joinedAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                    {" · "}{found.totalBookings} lượt đặt
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-end gap-2 justify-end">
                    <Star className="w-5 h-5 mb-1 fill-current" style={{ color: "hsl(var(--warm))" }} />
                    <span className="font-serif text-5xl text-foreground leading-none">{found.points}</span>
                  </div>
                  <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mt-1.5">
                    Số điểm
                  </p>
                  {found.points >= REDEMPTION_THRESHOLD && (
                    <button
                      onClick={handleRedeem}
                      className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-foreground text-primary-foreground text-[10px] tracking-[0.18em] uppercase hover:bg-foreground/85 transition-colors ml-auto"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Đổi giảm £{POINTS_VALUE}
                    </button>
                  )}
                </div>
              </div>

              {/* Manual adjustment */}
              <div className="border border-border p-5 space-y-5">
                <h3 className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Điều chỉnh điểm thủ công
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                      Số điểm *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={adjustDelta}
                      onChange={(e) => setAdjustDelta(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                      Lý do *
                    </label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="vd: Thưởng giới thiệu bạn bè"
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                      Ghi chú nội bộ (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      placeholder="Ghi chú admin…"
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAdjust("add")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-[10px] tracking-[0.18em] uppercase hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Cộng điểm
                  </button>
                  <button
                    onClick={() => handleAdjust("deduct")}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white text-[10px] tracking-[0.18em] uppercase hover:bg-red-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" /> Trừ điểm
                  </button>
                </div>
              </div>

              {/* Transaction history */}
              {customerTxs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    Lịch sử giao dịch ({customerTxs.length})
                  </h3>
                  <div className="border border-border divide-y divide-border">
                    {customerTxs.map((tx) => (
                      <div key={tx.id} className="flex items-start justify-between px-4 py-3.5 text-sm">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-foreground">{tx.reason}</p>
                          {tx.adminNote && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Ghi chú: {tx.adminNote}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                            {new Date(tx.createdAt).toLocaleString("vi-VN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span
                          className={`font-semibold whitespace-nowrap flex-shrink-0 ${
                            tx.delta > 0 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {tx.delta > 0 ? "+" : ""}{tx.delta} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* All Customers overview */}
      <div className="bg-card shadow-subtle overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-serif text-xl text-foreground">
            Tất cả khách hàng
            <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">
              ({customers.length})
            </span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                {["Tên", "Điện thoại", "Email", "Điểm", "Lịch đặt", "Ngày tham gia"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-[10px] tracking-[0.14em] uppercase text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...customers].sort((a, b) => b.points - a.points).map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => { setPhone(c.phone); setFound(c); setSearched(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                >
                  <td className="px-6 py-4 font-medium text-foreground">{c.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.phone}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" style={{ color: "hsl(var(--warm))" }} />
                      <span className="font-medium text-foreground">{c.points}</span>
                      {c.points >= REDEMPTION_THRESHOLD && (
                        <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 uppercase tracking-wider">
                          Đủ điều kiện
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{c.totalBookings}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(c.joinedAt).toLocaleDateString("vi-VN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPoints;
