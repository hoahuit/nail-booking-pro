import { useState } from "react";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  useAdminVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
  type ApiVoucher,
  type VoucherType,
} from "@/hooks/useAdminVouchers";

const EMPTY_FORM = {
  code: "",
  type: "PERCENT" as VoucherType,
  value: "",
  minOrder: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
};

const AdminVouchers = () => {
  const { data: vouchers = [], isLoading } = useAdminVouchers();
  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher();
  const deleteVoucher = useDeleteVoucher();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.code.trim()) {
      toast.error("Mã voucher là bắt buộc");
      return;
    }
    const val = parseFloat(form.value);
    if (!val || val <= 0) {
      toast.error("Giá trị phải lớn hơn 0");
      return;
    }
    if (form.type === "PERCENT" && val > 100) {
      toast.error("Phần trăm tối đa là 100");
      return;
    }

    if (editId) {
      updateVoucher.mutate({
        id: editId,
        payload: {
          isActive: form.isActive,
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          expiresAt: form.expiresAt
            ? new Date(form.expiresAt).toISOString()
            : null,
        },
      });
    } else {
      const code = form.code.trim().toUpperCase();
      createVoucher.mutate({
        code,
        type: form.type,
        value: val,
        minOrderValue: form.minOrder ? parseFloat(form.minOrder) : undefined,
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
        isActive: form.isActive,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : undefined,
      });
    }
    resetForm();
  };

  const toggleActive = (v: ApiVoucher) => {
    updateVoucher.mutate({ id: v.id, payload: { isActive: !v.isActive } });
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Xóa voucher ${code}?`)) return;
    deleteVoucher.mutate(id);
  };

  const startEdit = (v: ApiVoucher) => {
    setForm({
      code: v.code,
      type: v.type,
      value: String(v.value),
      minOrder: v.minOrderValue ? String(v.minOrderValue) : "",
      maxUses: v.maxUses ? String(v.maxUses) : "",
      expiresAt: v.expiresAt ? v.expiresAt.slice(0, 16) : "",
      isActive: v.isActive,
    });
    setEditId(v.id);
    setShowForm(true);
  };

  const filtered = vouchers.filter((v) =>
    filterActive === "all"
      ? true
      : filterActive === "active"
        ? v.isActive
        : !v.isActive,
  );

  const isExpired = (v: ApiVoucher) =>
    !!v.expiresAt && new Date(v.expiresAt) < new Date();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            Quản lý Voucher
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-light">
            Tạo và quản lý mã giảm giá cho khách hàng
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-primary-foreground text-[10px] tracking-[0.2em] uppercase hover:bg-foreground/85 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Tạo voucher
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Tổng voucher", value: isLoading ? "…" : vouchers.length },
          {
            label: "Đang hoạt động",
            value: isLoading ? "…" : vouchers.filter((v) => v.isActive).length,
          },
          {
            label: "Tổng lượt dùng",
            value: isLoading
              ? "…"
              : vouchers.reduce((s, v) => s + v.usedCount, 0),
          },
          {
            label: "Đã hết hạn",
            value: isLoading ? "…" : vouchers.filter(isExpired).length,
          },
        ].map((s) => (
          <div key={s.label} className="bg-card shadow-subtle px-5 py-4">
            <p className="font-serif text-3xl text-foreground">{s.value}</p>
            <p className="mt-1 text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Create / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-card shadow-subtle p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-foreground">
                {editId ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
              </h2>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Mã voucher *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  disabled={!!editId}
                  placeholder="vd: SUMMER20"
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors disabled:opacity-50 uppercase"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Loại *
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as VoucherType,
                    }))
                  }
                  disabled={!!editId}
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors disabled:opacity-50"
                >
                  <option value="PERCENT">Phần trăm (%)</option>
                  <option value="FIXED">Số tiền cố định (£)</option>
                </select>
              </div>

              {/* Value */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Giá trị * {form.type === "PERCENT" ? "(%)" : "(£)"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: e.target.value }))
                  }
                  disabled={!!editId}
                  placeholder={form.type === "PERCENT" ? "vd: 20" : "vd: 5"}
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Min order */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Đơn tối thiểu (£)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrder: e.target.value }))
                  }
                  disabled={!!editId}
                  placeholder="Không giới hạn"
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Max uses */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Giới hạn lượt dùng
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxUses: e.target.value }))
                  }
                  placeholder="Không giới hạn"
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                />
              </div>

              {/* Expires */}
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Hạn sử dụng
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                />
              </div>
            </div>

            {/* isActive toggle */}
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div
                onClick={() =>
                  setForm((f) => ({ ...f, isActive: !f.isActive }))
                }
                className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`}
                />
              </div>
              <span className="text-sm text-foreground">Kích hoạt ngay</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-7 py-3 bg-foreground text-primary-foreground text-[10px] tracking-[0.2em] uppercase hover:bg-foreground/85 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {editId ? "Lưu thay đổi" : "Tạo voucher"}
              </button>
              <button
                onClick={resetForm}
                className="px-7 py-3 border border-border text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className={`px-5 py-3 text-xs tracking-[0.14em] uppercase transition-colors border-b-2 -mb-px ${
              filterActive === f
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "Tất cả" : f === "active" ? "Đang hoạt động" : "Tắt"}
          </button>
        ))}
      </div>

      {/* Voucher table */}
      <div className="bg-card shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                {[
                  "Mã",
                  "Loại",
                  "Giá trị",
                  "Đơn tối thiểu",
                  "Đã dùng",
                  "Hạn sử dụng",
                  "Trạng thái",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-[10px] tracking-[0.14em] uppercase text-muted-foreground font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-muted-foreground text-sm"
                  >
                    Không có voucher nào
                  </td>
                </tr>
              )}
              {filtered.map((v) => {
                const expired = isExpired(v);
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 font-mono font-semibold text-foreground">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        {v.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] tracking-[0.12em] uppercase px-2 py-1 ${
                          v.type === "PERCENT"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {v.type === "PERCENT" ? "%" : "£ Cố định"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {v.type === "PERCENT" ? `${v.value}%` : `£${v.value}`}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {v.minOrderValue ? `£${v.minOrderValue}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {v.usedCount}
                      {v.maxUses ? ` / ${v.maxUses}` : ""}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {v.expiresAt ? (
                        <span className={expired ? "text-red-500" : ""}>
                          {new Date(v.expiresAt).toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {expired && " (hết hạn)"}
                        </span>
                      ) : (
                        "Không hết hạn"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(v)}
                        title={v.isActive ? "Tắt" : "Bật"}
                      >
                        {v.isActive ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(v)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.code)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminVouchers;
