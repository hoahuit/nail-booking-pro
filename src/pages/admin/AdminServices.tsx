import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Pencil,
  EyeOff,
  Eye,
  RefreshCw,
  X,
  Loader2,
  XCircle,
  ImageOff,
  Upload,
} from "lucide-react";
import {
  useAdminServices,
  useServiceCategories,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useUploadServiceImage,
  type ApiService,
  type ServicePayload,
} from "@/hooks/useAdminServices";

// Ảnh lưu dạng path tương đối → prefix backend khi hiển thị
const BACKEND = "http://localhost:4000";
function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BACKEND}${path}`;
}

// ── Service Form Modal ────────────────────────────────────────────────────────

const EMPTY: ServicePayload = {
  name: "",
  description: "",
  image: "",
  duration: 60,
  price: 0,
  category: "",
  isActive: true,
};

function ServiceModal({
  initial,
  onClose,
}: {
  initial?: ApiService | null;
  onClose: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<ServicePayload>(
    initial
      ? {
          name:        initial.name,
          description: initial.description ?? "",
          image:       initial.image ?? "",
          duration:    initial.duration,
          price:       parseFloat(initial.price),
          category:    initial.category,
          isActive:    initial.isActive,
        }
      : EMPTY,
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(resolveImageUrl(initial?.image));

  const { data: cats } = useServiceCategories();
  const create       = useCreateService();
  const update       = useUpdateService();
  const uploadImage  = useUploadServiceImage();

  const isPending = create.isPending || update.isPending || uploadImage.isPending;

  const set = <K extends keyof ServicePayload>(k: K, v: ServicePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = form.image ?? "";
    if (imageFile) {
      imageUrl = await uploadImage.mutateAsync(imageFile);
    }
    const payload: ServicePayload = {
      ...form,
      image:    imageUrl || undefined,
      price:    Number(form.price),
      duration: Number(form.duration),
    };
    if (isEdit && initial) {
      await update.mutateAsync({ id: initial.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition-colors placeholder:text-slate-400 shadow-sm";
  const labelCls =
    "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className={labelCls}>Tên dịch vụ *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
              placeholder="vd: Gel Manicure"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Danh mục *</label>
            <input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              list="category-list"
              className={inputCls}
              placeholder="vd: Manicure"
              required
            />
            <datalist id="category-list">
              {cats?.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Price + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Giá ($) *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => set("price", parseFloat(e.target.value))}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Thời lượng (phút) *</label>
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => set("duration", parseInt(e.target.value))}
                className={inputCls}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Mô tả</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Mô tả ngắn về dịch vụ…"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className={labelCls}>Hình ảnh dịch vụ</label>
            <div className="flex items-start gap-3">
              {/* Preview */}
              <div className="w-20 h-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageOff className="w-6 h-6 text-slate-300" />
                )}
              </div>

              {/* Picker */}
              <div className="flex-1 space-y-2">
                <label className="flex items-center gap-2 px-3.5 py-2.5 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-sm text-slate-500">
                  <Upload className="w-4 h-4 text-slate-400" />
                  {imageFile ? imageFile.name : "Chọn file ảnh…"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {imagePreview && !imageFile && (
                  <p className="text-xs text-slate-400 truncate">Ảnh hiện tại: {imagePreview}</p>
                )}
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(resolveImageUrl(initial?.image)); }}
                    className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    Bỏ chọn
                  </button>
                )}
                {uploadImage.isPending && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải ảnh lên…
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* isActive toggle */}
          {isEdit && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  form.isActive ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.isActive ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-sm text-muted-foreground">
                {form.isActive ? "Đang hiển thị" : "Đang ẩn"}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 text-sm font-medium bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Tạo dịch vụ"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const AdminServices = () => {
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage]             = useState(1);
  const [editing, setEditing]       = useState<ApiService | null | "new">(null);
  const LIMIT = 20;

  const { data, isLoading, isError, refetch, isFetching } = useAdminServices({
    search:   search   || undefined,
    category: category || undefined,
    isActive: showInactive ? undefined : true,
    page,
    limit: LIMIT,
  });

  const { data: cats } = useServiceCategories();
  const softDelete = useDeleteService();

  const services = data?.data ?? [];
  const meta     = data?.meta;

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleCategory = (v: string) => { setCategory(v); setPage(1); };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dịch vụ</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {meta ? `${meta.total} dịch vụ` : "Đang tải…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </button>
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-xs font-medium rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm dịch vụ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm theo tên, mô tả…"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition-colors placeholder:text-slate-400 shadow-sm"
          />
        </div>

        <select
          value={category}
          onChange={(e) => handleCategory(e.target.value)}
          className="px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 transition-colors text-slate-700 shadow-sm"
        >
          <option value="">Tất cả danh mục</option>
          {cats?.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          onClick={() => { setShowInactive((v) => !v); setPage(1); }}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border rounded-lg transition-colors shadow-sm ${
            showInactive
              ? "bg-slate-800 text-white border-slate-800"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          {showInactive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showInactive ? "Hiện tất cả" : "Chỉ hiển thị active"}
        </button>
      </div>

      {/* Grid / Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          <span className="text-sm text-slate-400">Đang tải dịch vụ…</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <XCircle className="w-8 h-8 text-red-300" />
          <p className="text-sm text-slate-500">Không thể tải dữ liệu</p>
          <button onClick={() => refetch()} className="text-xs text-rose-500 underline">Thử lại</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["", "Dịch vụ", "Danh mục", "Giá", "Thời lượng", "Trạng thái", "Thao tác"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-slate-400 text-sm">
                      Không có dịch vụ nào
                    </td>
                  </tr>
                ) : (
                  services.map((svc, i) => (
                    <motion.tr
                      key={svc.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`hover:bg-slate-50 transition-colors ${!svc.isActive ? "opacity-50" : ""}`}
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3 w-14">
                        {svc.image ? (
                          <img
                            src={resolveImageUrl(svc.image)}
                            alt={svc.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ImageOff className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </td>

                      {/* Name + desc */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-medium text-slate-700 truncate">{svc.name}</p>
                        {svc.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{svc.description}</p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">{svc.category}</span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                        ${parseFloat(svc.price).toFixed(0)}
                      </td>

                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {svc.duration} phút
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                            svc.isActive
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {svc.isActive ? "Hiển thị" : "Đã ẩn"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditing(svc)}
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => softDelete.mutate(svc.id)}
                            disabled={softDelete.isPending || !svc.isActive}
                            title={svc.isActive ? "Ẩn dịch vụ" : "Đã ẩn"}
                            className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors disabled:opacity-30"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-400 text-xs">
            Trang {meta.page} / {meta.totalPages} &nbsp;·&nbsp; {meta.total} kết quả
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || isFetching}
              className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {editing !== null && (
          <ServiceModal
            initial={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;
