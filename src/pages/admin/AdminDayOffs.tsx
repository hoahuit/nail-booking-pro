import { useMemo, useState } from "react";
import { CalendarX2, Loader2, RefreshCw, Save, Trash2 } from "lucide-react";
import {
  useAdminDayOffs,
  useDeleteDayOff,
  useUpsertDayOff,
} from "@/hooks/useAdminDayOffs";

const emptyForm = {
  date: "",
  reason: "",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const AdminDayOffs = () => {
  const [form, setForm] = useState(emptyForm);

  const { data = [], isLoading, isError, refetch, isFetching } = useAdminDayOffs();
  const upsert = useUpsertDayOff();
  const remove = useDeleteDayOff();

  const nowDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingCount = useMemo(
    () =>
      data.filter((item) => {
        const itemDate = new Date(`${item.date}T00:00:00`);
        return itemDate >= nowDate;
      }).length,
    [data, nowDate],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.date) return;

    await upsert.mutateAsync({
      date: form.date,
      reason: form.reason.trim() || null,
    });

    setForm(emptyForm);
  };

  const handleDelete = (id: string, date: string) => {
    if (!confirm(`Xóa ngày nghỉ ${date}?`)) return;
    remove.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ngày nghỉ</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {isLoading
              ? "Đang tải..."
              : `${data.length} ngày nghỉ · ${upcomingCount} sắp tới`}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 grid md:grid-cols-[180px_1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Ngày nghỉ
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, date: event.target.value }))
            }
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            Lý do (tùy chọn)
          </label>
          <input
            type="text"
            value={form.reason}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, reason: event.target.value }))
            }
            placeholder="Ví dụ: Team building"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={upsert.isPending}
          className="h-[42px] px-4 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
        >
          {upsert.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Lưu ngày nghỉ
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-sm text-slate-400">Đang tải ngày nghỉ...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-500">
            Không thể tải danh sách ngày nghỉ
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
            <CalendarX2 className="w-8 h-8" />
            <p className="text-sm">Chưa có ngày nghỉ nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                    Lý do
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {item.reason?.trim() || "-"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.date)}
                        disabled={remove.isPending}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 rounded-md text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDayOffs;
