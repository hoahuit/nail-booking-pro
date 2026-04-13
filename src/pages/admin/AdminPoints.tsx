import { useState } from "react";
import { Search, Star, Plus, Minus, Phone, User, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { mockCustomers, mockTransactions } from "@/lib/mockAdminData";
import type { Customer, PointTransaction } from "@/lib/adminTypes";

const REDEMPTION_THRESHOLD = 100;
const POINTS_VALUE = 5;
const POINTS_PER_POUND = 0.1; // £10 = 1 point

const AdminPoints = () => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>(
    "admin_customers",
    mockCustomers,
  );
  const [transactions, setTransactions] = useLocalStorage<PointTransaction[]>(
    "admin_transactions",
    mockTransactions,
  );

  // Search state
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<Customer | null>(null);
  const [notFound, setNotFound] = useState(false);

  // New customer name (when auto-creating)
  const [newName, setNewName] = useState("");

  // Add points delta input
  const [addAmount, setAddAmount] = useState("");

  const doSearch = () => {
    if (!phone.trim()) return;
    const norm = phone.replace(/\s/g, "");
    const c = customers.find((c) => c.phone.replace(/\s/g, "") === norm);
    setFound(c ?? null);
    setNotFound(!c);
    setNewName("");
    setAddAmount("");
  };

  const applyPoints = (delta: number, reason: string) => {
    const normPhone = phone.replace(/\s/g, "");
    let customer = found;

    // Auto-create if new
    if (!customer) {
      const nc: Customer = {
        id: `c${Date.now()}`,
        name: newName.trim() || "Khách hàng",
        phone: normPhone,
        email: "",
        points: 0,
        totalBookings: 0,
        joinedAt: new Date().toISOString(),
      };
      setCustomers((prev) => [nc, ...prev]);
      customer = nc;
    }

    const tx: PointTransaction = {
      id: `t${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      phone: normPhone,
      delta,
      reason,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);

    const newPts = Math.max(0, customer.points + delta);
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer!.id ? { ...c, points: newPts } : c)),
    );
    setFound((prev) =>
      prev ? { ...prev, points: newPts } : { ...customer!, points: newPts },
    );
    setNotFound(false);
  };

  const handleAddPoints = () => {
    const pts = parseInt(addAmount);
    if (!pts || pts <= 0) {
      toast.error("Nhập số điểm hợp lệ");
      return;
    }
    if (notFound && !newName.trim()) {
      toast.error("Vui lòng nhập tên khách hàng mới");
      return;
    }
    applyPoints(pts, `Cộng điểm thủ công (+${pts})`);
    toast.success(`+${pts} điểm`);
    setAddAmount("");
  };

  const handleRedeem = () => {
    if (!found || found.points < REDEMPTION_THRESHOLD) {
      toast.error(`Cần tối thiểu ${REDEMPTION_THRESHOLD} điểm`);
      return;
    }
    applyPoints(
      -REDEMPTION_THRESHOLD,
      `Đổi ${REDEMPTION_THRESHOLD} điểm — giảm £${POINTS_VALUE}`,
    );
    toast.success(`Đã đổi £${POINTS_VALUE} cho ${found.name}`);
  };

  const customerTxs = transactions.filter(
    (t) => t.phone.replace(/\s/g, "") === phone.replace(/\s/g, ""),
  );

  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">
          Quản lý điểm
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          Nhập SĐT → tra cứu và tích điểm cho khách
        </p>
      </div>

      {/* Rule bar */}
      <div
        className="bg-card border-l-[3px] px-5 py-3 flex flex-wrap gap-8 shadow-subtle text-sm"
        style={{ borderColor: "hsl(var(--warm))" }}
      >
        <span className="text-muted-foreground">
          £10 = <strong className="text-foreground">1 điểm</strong>
        </span>
        <span className="text-muted-foreground">
          100 điểm ={" "}
          <strong className="text-foreground">£{POINTS_VALUE} giảm</strong>
        </span>
      </div>

      {/* Phone search */}
      <div className="bg-card shadow-subtle p-6 space-y-4">
        <h2 className="font-serif text-xl text-foreground flex items-center gap-2">
          <Phone className="w-4 h-4" style={{ color: "hsl(var(--warm))" }} />
          Nhập số điện thoại
        </h2>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFound(null);
                setNotFound(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="vd: 07700900002"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
            />
          </div>
          <button
            onClick={doSearch}
            disabled={!phone.trim()}
            className="px-6 py-2.5 bg-foreground text-primary-foreground text-xs tracking-[0.18em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-35"
          >
            Tìm
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Not found — auto-create */}
          {notFound && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 pt-1"
            >
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản với SĐT này. Nhập tên để tạo mới:
              </p>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên khách hàng"
                className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Số điểm cộng"
                  className="w-36 px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                />
                <button
                  onClick={handleAddPoints}
                  disabled={!addAmount || !newName.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-xs tracking-[0.16em] uppercase hover:bg-green-700 transition-colors disabled:opacity-35"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo & Cộng điểm
                </button>
              </div>
            </motion.div>
          )}

          {/* Found */}
          {found && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5 pt-1"
            >
              {/* Customer info */}
              <div className="flex items-center gap-4 p-4 border border-border">
                <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl text-foreground">
                    {found.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{found.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-end gap-1 justify-end">
                    <Star
                      className="w-4 h-4 mb-0.5 fill-current"
                      style={{ color: "hsl(var(--warm))" }}
                    />
                    <span className="font-serif text-4xl text-foreground leading-none">
                      {found.points}
                    </span>
                  </div>
                  <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground mt-1">
                    điểm
                  </p>
                </div>
              </div>

              {/* Add points */}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="number"
                  min="1"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Số điểm cộng"
                  className="w-40 px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                />
                <button
                  onClick={handleAddPoints}
                  disabled={!addAmount}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-xs tracking-[0.16em] uppercase hover:bg-green-700 transition-colors disabled:opacity-35"
                >
                  <Plus className="w-3.5 h-3.5" /> Cộng điểm
                </button>
                {found.points >= REDEMPTION_THRESHOLD && (
                  <button
                    onClick={handleRedeem}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-primary-foreground text-xs tracking-[0.16em] uppercase hover:bg-foreground/85 transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5" /> Đổi £{POINTS_VALUE}
                  </button>
                )}
              </div>

              {/* Transaction history */}
              {customerTxs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    Lịch sử ({customerTxs.length})
                  </p>
                  <div className="border border-border divide-y divide-border max-h-56 overflow-y-auto">
                    {customerTxs.slice(0, 20).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="text-foreground text-xs">{tx.reason}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                            {new Date(tx.createdAt).toLocaleString("vi-VN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span
                          className={`font-semibold text-sm flex-shrink-0 ml-4 ${tx.delta > 0 ? "text-green-600" : "text-red-500"}`}
                        >
                          {tx.delta > 0 ? "+" : ""}
                          {tx.delta}
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

      {/* All Customers table */}
      <div className="bg-card shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
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
                {["Tên", "Điện thoại", "Điểm", "Lịch đặt"].map((h) => (
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
              {[...customers]
                .sort((a, b) => b.points - a.points)
                .map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setPhone(c.phone);
                      setFound(c);
                      setNotFound(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {c.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {c.phone}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5">
                        <Star
                          className="w-3.5 h-3.5 fill-current"
                          style={{ color: "hsl(var(--warm))" }}
                        />
                        <span className="font-medium text-foreground">
                          {c.points}
                        </span>
                        {c.points >= REDEMPTION_THRESHOLD && (
                          <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 uppercase tracking-wider">
                            Đủ ĐK
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {c.totalBookings}
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
