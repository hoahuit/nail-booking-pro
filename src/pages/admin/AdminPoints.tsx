import { useState } from "react";
import { Search, Star, Plus, Minus, Phone, User, Gift, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  lookupByPhone,
  useAddPoints,
  useAdjustPoints,
  useLoyaltyAccounts,
  type LoyaltyAccountDetail,
} from "@/hooks/useAdminPoints";

const REDEMPTION_THRESHOLD = 100;
const POINTS_VALUE = 5;
const POINTS_PER_POUND = 10; // £10 = 1 point

const AdminPoints = () => {
  // ── Search ──────────────────────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [account, setAccount] = useState<LoyaltyAccountDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [newName, setNewName] = useState("");

  // ── Actions ─────────────────────────────────────────────────────────────────
  const [addAmount, setAddAmount] = useState(""); // £ amount spent
  const [adjustPts, setAdjustPts] = useState("");  // raw points (signed)
  const [adjustNote, setAdjustNote] = useState("");

  const addPointsMut    = useAddPoints();
  const adjustPointsMut = useAdjustPoints();

  // ── Table ───────────────────────────────────────────────────────────────────
  const [listSearch, setListSearch] = useState("");
  const [listPage, setListPage]     = useState(1);
  const { data: listData, isLoading: listLoading, refetch: refetchList } = useLoyaltyAccounts(listSearch, listPage);
  const accounts = listData?.data ?? [];
  const listMeta = listData?.meta;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const doSearch = async () => {
    const norm = phone.replace(/\s/g, "");
    if (!norm) return;
    setSearching(true);
    setAccount(null);
    setNotFound(false);
    setAddAmount("");
    setAdjustPts("");
    setAdjustNote("");
    try {
      const result = await lookupByPhone(norm);
      setAccount(result);
    } catch (err: any) {
      if (err?.status === 404) setNotFound(true);
      else toast.error("Không thể tra cứu SĐT");
    } finally {
      setSearching(false);
    }
  };

  const refreshAccount = async () => {
    const norm = phone.replace(/\s/g, "");
    if (!norm) return;
    try {
      const result = await lookupByPhone(norm);
      setAccount(result);
    } catch { /* silent */ }
  };

  const handleAddBySpending = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) { toast.error("Nhập số tiền hợp lệ"); return; }
    if (notFound && !newName.trim()) { toast.error("Nhập tên khách hàng"); return; }

    const norm = phone.replace(/\s/g, "");
    await addPointsMut.mutateAsync({
      phone: norm,
      amountSpent: amount,
      ...(notFound && newName.trim() ? { customerName: newName.trim() } : {}),
      note: `Tích điểm chi tiêu £${amount}`,
    });

    const pts = Math.floor(amount / POINTS_PER_POUND);
    toast.success(`+${pts} điểm cho £${amount} chi tiêu`);
    setAddAmount("");
    setNotFound(false);
    setNewName("");
    await refreshAccount();
    refetchList();
  };

  const handleAdjust = async (delta?: number) => {
    const pts = delta ?? parseInt(adjustPts);
    if (!pts || pts === 0) { toast.error("Nhập số điểm điều chỉnh"); return; }
    const note = delta
      ? `Đổi ${REDEMPTION_THRESHOLD} điểm — giảm £${POINTS_VALUE}`
      : (adjustNote.trim() || (pts > 0 ? "Cộng điểm thủ công" : "Trừ điểm thủ công"));

    const norm = phone.replace(/\s/g, "");
    await adjustPointsMut.mutateAsync({ phone: norm, points: pts, note });

    toast.success(`${pts > 0 ? "+" : ""}${pts} điểm`);
    if (!delta) { setAdjustPts(""); setAdjustNote(""); }
    await refreshAccount();
    refetchList();
  };

  const isPending = addPointsMut.isPending || adjustPointsMut.isPending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Quản lý điểm</h1>
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
          £{POINTS_PER_POUND} = <strong className="text-foreground">1 điểm</strong>
        </span>
        <span className="text-muted-foreground">
          {REDEMPTION_THRESHOLD} điểm ={" "}
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
                setAccount(null);
                setNotFound(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="vd: 07700900002"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
            />
          </div>
          <button
            onClick={doSearch}
            disabled={!phone.trim() || searching}
            className="px-6 py-2.5 bg-foreground text-primary-foreground text-xs tracking-[0.18em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-35 flex items-center gap-2"
          >
            {searching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Tìm
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Not found — create new */}
          {notFound && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 pt-1"
            >
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản với SĐT này. Nhập tên và số tiền để tạo mới:
              </p>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên khách hàng"
                className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Số tiền chi tiêu (£)"
                    className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  {addAmount && parseFloat(addAmount) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = {Math.floor(parseFloat(addAmount) / POINTS_PER_POUND)} điểm
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAddBySpending}
                  disabled={!addAmount || !newName.trim() || isPending}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-xs tracking-[0.16em] uppercase hover:bg-green-700 transition-colors disabled:opacity-35"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Tạo &amp; Cộng điểm
                </button>
              </div>
            </motion.div>
          )}

          {/* Found */}
          {account && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5 pt-1"
            >
              {/* Account card */}
              <div className="flex items-center gap-4 p-4 border border-border">
                <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl text-foreground">
                    {account.customerName ?? "Khách hàng"}
                  </p>
                  <p className="text-xs text-muted-foreground">{account.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-end gap-1 justify-end">
                    <Star className="w-4 h-4 mb-0.5 fill-current" style={{ color: "hsl(var(--warm))" }} />
                    <span className="font-serif text-4xl text-foreground leading-none">
                      {account.totalPoints}
                    </span>
                  </div>
                  <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground mt-1">điểm</p>
                </div>
              </div>

              {/* Add points by spending */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  Tích điểm theo hóa đơn
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="Số tiền (£)"
                      className="w-40 px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                    />
                    {addAmount && parseFloat(addAmount) > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        = {Math.floor(parseFloat(addAmount) / POINTS_PER_POUND)} điểm
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleAddBySpending}
                    disabled={!addAmount || isPending}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-xs tracking-[0.16em] uppercase hover:bg-green-700 transition-colors disabled:opacity-35"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Cộng điểm
                  </button>
                  {account.totalPoints >= REDEMPTION_THRESHOLD && (
                    <button
                      onClick={() => handleAdjust(-REDEMPTION_THRESHOLD)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-primary-foreground text-xs tracking-[0.16em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-35"
                    >
                      <Gift className="w-3.5 h-3.5" /> Đổi £{POINTS_VALUE}
                    </button>
                  )}
                </div>
              </div>

              {/* Manual adjust */}
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  Điều chỉnh thủ công
                </p>
                <div className="flex items-start gap-3 flex-wrap">
                  <input
                    type="number"
                    value={adjustPts}
                    onChange={(e) => setAdjustPts(e.target.value)}
                    placeholder="Điểm (+/-)"
                    className="w-36 px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="Lý do (tùy chọn)"
                    className="flex-1 min-w-[160px] px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  <button
                    onClick={() => handleAdjust()}
                    disabled={!adjustPts || parseInt(adjustPts) === 0 || isPending}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-primary-foreground text-xs tracking-[0.16em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-35"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* History */}
              {account.history && account.history.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    Lịch sử ({account.history.length})
                  </p>
                  <div className="border border-border divide-y divide-border max-h-56 overflow-y-auto">
                    {account.history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <p className="text-foreground text-xs">{h.note ?? h.type}</p>
                          {h.amountSpent != null && (
                            <p className="text-[10px] text-muted-foreground/60">Chi tiêu: £{h.amountSpent}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                            {new Date(h.createdAt).toLocaleString("vi-VN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span className={`font-semibold text-sm flex-shrink-0 ml-4 ${h.points > 0 ? "text-green-600" : "text-red-500"}`}>
                          {h.points > 0 ? "+" : ""}{h.points}
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

      {/* All Accounts table */}
      <div className="bg-card shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-serif text-xl text-foreground">
            Tất cả khách hàng
            {listMeta && (
              <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">
                ({listMeta.total})
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={listSearch}
                onChange={(e) => { setListSearch(e.target.value); setListPage(1); }}
                placeholder="Tìm tên, SĐT…"
                className="pl-9 pr-4 py-2 text-xs bg-background border border-border outline-none focus:border-foreground/40 transition-colors w-48"
              />
            </div>
            <button
              onClick={() => refetchList()}
              disabled={listLoading}
              className="p-2 border border-border hover:bg-secondary/50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${listLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {listLoading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Đang tải...</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  {["Tên", "Điện thoại", "Điểm", "Ngày tạo"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] tracking-[0.14em] uppercase text-muted-foreground font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground text-sm">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  accounts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setPhone(c.phone);
                        setAccount(null);
                        setNotFound(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        lookupByPhone(c.phone).then(setAccount).catch(() => {});
                      }}
                    >
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {c.customerName ?? <span className="italic text-muted-foreground">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.phone}</td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-current" style={{ color: "hsl(var(--warm))" }} />
                          <span className="font-medium text-foreground">{c.totalPoints}</span>
                          {c.totalPoints >= REDEMPTION_THRESHOLD && (
                            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 uppercase tracking-wider">
                              Đủ ĐK
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {listMeta && listMeta.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Trang {listMeta.page} / {listMeta.totalPages} · {listMeta.total} kết quả</span>
            <div className="flex gap-2">
              <button
                onClick={() => setListPage((p) => Math.max(1, p - 1))}
                disabled={listPage === 1 || listLoading}
                className="px-3 py-1.5 border border-border hover:bg-secondary/50 disabled:opacity-40 transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setListPage((p) => Math.min(listMeta.totalPages, p + 1))}
                disabled={listPage === listMeta.totalPages || listLoading}
                className="px-3 py-1.5 border border-border hover:bg-secondary/50 disabled:opacity-40 transition-colors"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPoints;
