import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Star,
  Plus,
  Minus,
  Phone,
  User,
  Gift,
  RefreshCw,
  Loader2,
  Settings,
  X,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  lookupByPhone,
  useAddPoints,
  useAdjustPoints,
  useLoyaltyAccounts,
  useLoyaltySettings,
  useUpdateLoyaltySettings,
  useCreateRewardRule,
  useUpdateRewardRule,
  useDeleteRewardRule,
  useDeactivateLoyaltyAccount,
  type LoyaltyAccountDetail,
  type LoyaltyRewardRule,
} from "@/hooks/useAdminPoints";

type RewardType = "FIXED" | "PERCENT";

type RuleForm = {
  thresholdPoints: string;
  rewardType: RewardType;
  rewardValue: string;
  isActive: boolean;
};

const EMPTY_RULE_FORM: RuleForm = {
  thresholdPoints: "",
  rewardType: "FIXED",
  rewardValue: "",
  isActive: true,
};

function rewardLabel(rule: LoyaltyRewardRule): string {
  return rule.rewardType === "FIXED"
    ? `Giảm £${rule.rewardValue}`
    : `Giảm ${rule.rewardValue}%`;
}

function MilestoneConfirmModal({
  open,
  messages,
  onClose,
}: {
  open: boolean;
  messages: string[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-slate-100 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Xác nhận ưu đãi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-2">
          {messages.map((message, index) => (
            <p key={index} className="text-sm text-slate-700">
              {message}
            </p>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs bg-slate-900 text-white rounded-md hover:bg-slate-700 transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

function RulesConfigModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const settingsQuery = useLoyaltySettings();
  const updateSettings = useUpdateLoyaltySettings();
  const createRule = useCreateRewardRule();
  const updateRule = useUpdateRewardRule();
  const deleteRule = useDeleteRewardRule();

  const [pointsPerVisit, setPointsPerVisit] = useState("1");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleForm>(EMPTY_RULE_FORM);

  useEffect(() => {
    if (!open) return;
    if (settingsQuery.data?.pointsPerVisit) {
      setPointsPerVisit(String(settingsQuery.data.pointsPerVisit));
    }
  }, [open, settingsQuery.data?.pointsPerVisit]);

  const rules = settingsQuery.data?.rewardRules ?? [];

  const pending =
    updateSettings.isPending ||
    createRule.isPending ||
    updateRule.isPending ||
    deleteRule.isPending;

  const resetForm = () => {
    setEditingRuleId(null);
    setForm(EMPTY_RULE_FORM);
  };

  const handleSavePointsPerVisit = async () => {
    const parsed = Number.parseInt(pointsPerVisit, 10);
    if (!parsed || parsed < 1 || parsed > 100) {
      toast.error("Điểm mỗi lượt phải từ 1 đến 100");
      return;
    }
    await updateSettings.mutateAsync({ pointsPerVisit: parsed });
  };

  const handleSaveRule = async () => {
    const threshold = Number.parseInt(form.thresholdPoints, 10);
    const value = Number.parseFloat(form.rewardValue);

    if (!threshold || threshold < 1) {
      toast.error("Threshold points phải >= 1");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Reward value phải > 0");
      return;
    }
    if (form.rewardType === "PERCENT" && value > 100) {
      toast.error("Reward value với PERCENT phải <= 100");
      return;
    }

    if (editingRuleId) {
      await updateRule.mutateAsync({
        id: editingRuleId,
        payload: {
          thresholdPoints: threshold,
          rewardType: form.rewardType,
          rewardValue: value,
          isActive: form.isActive,
        },
      });
    } else {
      await createRule.mutateAsync({
        thresholdPoints: threshold,
        rewardType: form.rewardType,
        rewardValue: value,
        isActive: form.isActive,
      });
    }

    resetForm();
  };

  const handleEditRule = (rule: LoyaltyRewardRule) => {
    setEditingRuleId(rule.id);
    setForm({
      thresholdPoints: String(rule.thresholdPoints),
      rewardType: rule.rewardType,
      rewardValue: String(rule.rewardValue),
      isActive: rule.isActive !== false,
    });
  };

  const handleDeleteRule = async (rule: LoyaltyRewardRule) => {
    const ok = confirm(
      `Xóa rule ${rule.thresholdPoints} điểm -> ${rewardLabel(rule)}?`,
    );
    if (!ok) return;
    await deleteRule.mutateAsync(rule.id);
    if (editingRuleId === rule.id) resetForm();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Cấu hình loyalty</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quản lý điểm mỗi lượt ghé và điều kiện giảm giá
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="p-4 border border-slate-200 rounded-lg space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              Điểm mỗi lượt ghé
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={pointsPerVisit}
                onChange={(event) => setPointsPerVisit(event.target.value)}
                className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-rose-300"
              />
              <button
                onClick={() => void handleSavePointsPerVisit()}
                disabled={pending || settingsQuery.isLoading}
                className="px-3.5 py-2 text-xs bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                {updateSettings.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Lưu
              </button>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                Điều kiện giảm giá
              </p>
              <button
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Tạo rule mới
              </button>
            </div>

            <div className="grid sm:grid-cols-4 gap-2">
              <input
                type="number"
                min="1"
                value={form.thresholdPoints}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    thresholdPoints: event.target.value,
                  }))
                }
                placeholder="Threshold"
                className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-rose-300"
              />

              <select
                value={form.rewardType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    rewardType: event.target.value as RewardType,
                  }))
                }
                className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-rose-300"
              >
                <option value="FIXED">FIXED (£)</option>
                <option value="PERCENT">PERCENT (%)</option>
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.rewardValue}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    rewardValue: event.target.value,
                  }))
                }
                placeholder={
                  form.rewardType === "FIXED" ? "Value £" : "Value %"
                }
                className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-rose-300"
              />

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                  Active
                </label>
                <button
                  onClick={() => void handleSaveRule()}
                  disabled={pending}
                  className="ml-auto px-3 py-2 text-xs bg-rose-500 text-white rounded-md hover:bg-rose-600 disabled:opacity-40 transition-colors"
                >
                  {editingRuleId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-left text-xs text-slate-500">
                      Threshold
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-slate-500">
                      Loại
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-slate-500">
                      Giá trị
                    </th>
                    <th className="px-3 py-2 text-left text-xs text-slate-500">
                      Trạng thái
                    </th>
                    <th className="px-3 py-2 text-right text-xs text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {settingsQuery.isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-sm text-slate-400"
                      >
                        Đang tải...
                      </td>
                    </tr>
                  ) : rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-sm text-slate-400"
                      >
                        Chưa có rule nào
                      </td>
                    </tr>
                  ) : (
                    rules
                      .slice()
                      .sort((a, b) => a.thresholdPoints - b.thresholdPoints)
                      .map((rule) => (
                        <tr
                          key={rule.id}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="px-3 py-2">{rule.thresholdPoints}</td>
                          <td className="px-3 py-2">{rule.rewardType}</td>
                          <td className="px-3 py-2">{rewardLabel(rule)}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`text-xs ${rule.isActive !== false ? "text-green-600" : "text-slate-400"}`}
                            >
                              {rule.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditRule(rule)}
                                className="p-1 text-slate-500 hover:text-slate-700"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => void handleDeleteRule(rule)}
                                className="p-1 text-slate-500 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AdminPoints = () => {
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [account, setAccount] = useState<LoyaltyAccountDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [newName, setNewName] = useState("");

  const [staffName, setStaffName] = useState("");
  const [addAmountSpent, setAddAmountSpent] = useState("");
  const [addNote, setAddNote] = useState("");
  const [adjustPts, setAdjustPts] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneMessages, setMilestoneMessages] = useState<string[]>([]);

  const addPointsMut = useAddPoints();
  const adjustPointsMut = useAdjustPoints();
  const deactivateAccountMut = useDeactivateLoyaltyAccount();
  const settingsQuery = useLoyaltySettings();

  const [listSearch, setListSearch] = useState("");
  const [listPage, setListPage] = useState(1);
  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useLoyaltyAccounts(listSearch, listPage);

  const accounts = listData?.data ?? [];
  const listMeta = listData?.meta;

  const minThreshold = useMemo(() => {
    const rules = settingsQuery.data?.rewardRules ?? [];
    const active = rules.filter((item) => item.isActive !== false);
    if (!active.length) return null;
    return Math.min(...active.map((item) => item.thresholdPoints));
  }, [settingsQuery.data?.rewardRules]);

  const doSearch = async () => {
    const norm = phone.replace(/\s/g, "");
    if (!norm) return;

    setSearching(true);
    setAccount(null);
    setNotFound(false);
    try {
      const result = await lookupByPhone(norm);
      setAccount(result);
    } catch (err: unknown) {
      const maybeErr = err as { status?: number };
      if (maybeErr?.status === 404) setNotFound(true);
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
    } catch {
      // ignore
    }
  };

  const handleAddVisit = async () => {
    const norm = phone.replace(/\s/g, "");
    if (!norm) {
      toast.error("Nhập SĐT trước");
      return;
    }

    if (notFound && !newName.trim()) {
      toast.error("Nhập tên khách hàng");
      return;
    }

    if (!staffName.trim()) {
      toast.error("Nhập tên nhân viên để cộng điểm");
      return;
    }

    const parsedSpent = addAmountSpent.trim()
      ? Number.parseFloat(addAmountSpent)
      : undefined;
    if (
      addAmountSpent.trim() &&
      (!Number.isFinite(parsedSpent) || (parsedSpent ?? 0) <= 0)
    ) {
      toast.error("amountSpent phải là số > 0");
      return;
    }

    const pointsPerVisit = settingsQuery.data?.pointsPerVisit ?? 1;
    const previousPoints = account?.totalPoints ?? 0;
    const activeRules = (settingsQuery.data?.rewardRules ?? [])
      .filter((rule) => rule.isActive !== false)
      .sort((a, b) => a.thresholdPoints - b.thresholdPoints);

    const added = await addPointsMut.mutateAsync({
      phone: norm,
      ...(notFound && newName.trim() ? { customerName: newName.trim() } : {}),
      staffName: staffName.trim(),
      ...(parsedSpent ? { amountSpent: parsedSpent } : {}),
      ...(addNote.trim() ? { note: addNote.trim() } : {}),
    });

    toast.success(`+${pointsPerVisit} điểm`);

    const currentPoints =
      typeof added?.totalPoints === "number"
        ? added.totalPoints
        : previousPoints + pointsPerVisit;
    const unlockedRules = activeRules.filter(
      (rule) =>
        previousPoints < rule.thresholdPoints &&
        currentPoints >= rule.thresholdPoints,
    );

    if (unlockedRules.length > 0) {
      const messages = unlockedRules.map(
        (rule) =>
          `Khách đã tích lũy đủ ${rule.thresholdPoints} lần, được ${rewardLabel(rule)}.`,
      );
      setMilestoneMessages(messages);
      setMilestoneModalOpen(true);
    }

    setNotFound(false);
    setNewName("");
    setAddAmountSpent("");
    setAddNote("");
    await refreshAccount();
    void refetchList();
  };

  const handleAdjust = async () => {
    const value = Number.parseInt(adjustPts, 10);
    if (!value || value === 0) {
      toast.error("Nhập số điểm điều chỉnh");
      return;
    }

    const note =
      adjustNote.trim() ||
      (value > 0 ? "Cộng điểm thủ công" : "Trừ điểm thủ công");
    const norm = phone.replace(/\s/g, "");

    await adjustPointsMut.mutateAsync({
      phone: norm,
      points: value,
      note,
      ...(staffName.trim() ? { staffName: staffName.trim() } : {}),
    });

    toast.success(`${value > 0 ? "+" : ""}${value} điểm`);
    setAdjustPts("");
    setAdjustNote("");
    await refreshAccount();
    void refetchList();
  };

  const isPending = addPointsMut.isPending || adjustPointsMut.isPending;

  const handleDeactivateAccount = async (phoneToDeactivate: string) => {
    const ok = confirm(`Khóa tài khoản loyalty của SĐT ${phoneToDeactivate}?`);
    if (!ok) return;

    await deactivateAccountMut.mutateAsync(phoneToDeactivate);

    if (account?.phone === phoneToDeactivate) {
      setAccount(null);
      setPhone("");
      setNotFound(false);
    }
  };

  return (
    <div className="space-y-8">
      <MilestoneConfirmModal
        open={milestoneModalOpen}
        messages={milestoneMessages}
        onClose={() => setMilestoneModalOpen(false)}
      />

      <RulesConfigModal
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            Quản lý điểm
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-light">
            Đơn giản: cộng điểm theo lượt ghé và điều chỉnh +/- điểm.
          </p>
        </div>
        <button
          onClick={() => setConfigModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 text-white text-xs tracking-[0.14em] uppercase rounded-md hover:bg-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          Cấu hình giảm giá
        </button>
      </div>

      <div
        className="bg-card border-l-[3px] px-5 py-3 flex flex-wrap gap-8 shadow-subtle text-sm"
        style={{ borderColor: "hsl(var(--warm))" }}
      >
        <span className="text-muted-foreground">
          Mỗi lượt ghé ={" "}
          <strong className="text-foreground">
            {settingsQuery.data?.pointsPerVisit ?? "..."} điểm
          </strong>
        </span>
        <span className="text-muted-foreground">
          Rule giảm giá:{" "}
          {(settingsQuery.data?.rewardRules ?? [])
            .filter((rule) => rule.isActive !== false)
            .sort((a, b) => a.thresholdPoints - b.thresholdPoints)
            .map((rule) => `${rule.thresholdPoints} -> ${rewardLabel(rule)}`)
            .join(" | ") || "Chưa có"}
        </span>
      </div>

      <div className="bg-card shadow-subtle p-6 space-y-4">
        <h2 className="font-serif text-xl text-foreground flex items-center gap-2">
          <Phone className="w-4 h-4" style={{ color: "hsl(var(--warm))" }} />
          Nhập số điện thoại
        </h2>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setAccount(null);
                setNotFound(false);
              }}
              onKeyDown={(event) => event.key === "Enter" && void doSearch()}
              placeholder="vd: 07700900002"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
            />
          </div>
          <input
            type="text"
            value={staffName}
            onChange={(event) => setStaffName(event.target.value)}
            placeholder="Nhân viên (tùy ý)"
            className="w-56 px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
          />
          <button
            onClick={() => void doSearch()}
            disabled={!phone.trim() || searching}
            className="px-6 py-2.5 bg-foreground text-primary-foreground text-xs tracking-[0.18em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-35 flex items-center gap-2"
          >
            {searching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Tìm
          </button>
        </div>

        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3 pt-1"
            >
              <p className="text-sm text-muted-foreground">
                Chưa có tài khoản với SĐT này. Nhập tên để tạo mới và cộng điểm.
              </p>
              <input
                type="text"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Tên khách hàng"
                className="w-full px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
              />
              <button
                onClick={() => void handleAddVisit()}
                disabled={!newName.trim() || isPending}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-xs tracking-[0.16em] uppercase hover:bg-green-700 transition-colors disabled:opacity-35"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Tạo & Cộng điểm
              </button>

              <div className="grid sm:grid-cols-3 gap-2 pt-2">
                <input
                  type="text"
                  value={staffName}
                  onChange={(event) => setStaffName(event.target.value)}
                  placeholder="staffName *"
                  className="px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addAmountSpent}
                  onChange={(event) => setAddAmountSpent(event.target.value)}
                  placeholder="amountSpent (optional)"
                  className="px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                />
                <input
                  type="text"
                  value={addNote}
                  onChange={(event) => setAddNote(event.target.value)}
                  placeholder="note (optional)"
                  className="px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                />
              </div>
            </motion.div>
          )}

          {account && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5 pt-1"
            >
              <div className="flex items-center gap-4 p-4 border border-border rounded-md">
                <div className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl text-foreground">
                    {account.customerName ?? "Khách hàng"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account.phone}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-end gap-1 justify-end">
                    <Star
                      className="w-4 h-4 mb-0.5 fill-current"
                      style={{ color: "hsl(var(--warm))" }}
                    />
                    <span className="font-serif text-4xl text-foreground leading-none">
                      {account.totalPoints}
                    </span>
                  </div>
                  <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground mt-1">
                    điểm
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  Cộng điểm theo lượt
                </p>
                <div className="grid sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={staffName}
                    onChange={(event) => setStaffName(event.target.value)}
                    placeholder="staffName *"
                    className="px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={addAmountSpent}
                    onChange={(event) => setAddAmountSpent(event.target.value)}
                    placeholder="amountSpent"
                    className="px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={addNote}
                    onChange={(event) => setAddNote(event.target.value)}
                    placeholder="note"
                    className="px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={`+${settingsQuery.data?.pointsPerVisit ?? 1} điểm`}
                    readOnly
                    className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 text-slate-600"
                  />
                </div>
                <button
                  onClick={() => void handleAddVisit()}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-xs tracking-[0.16em] uppercase hover:bg-green-700 transition-colors disabled:opacity-35"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Cộng điểm
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  Điều chỉnh +/- điểm
                </p>
                <div className="flex items-start gap-3 flex-wrap">
                  <input
                    type="number"
                    value={adjustPts}
                    onChange={(event) => setAdjustPts(event.target.value)}
                    placeholder="Nhập số điểm (+/-)"
                    className="w-44 px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  <input
                    type="text"
                    value={adjustNote}
                    onChange={(event) => setAdjustNote(event.target.value)}
                    placeholder="Lý do"
                    className="flex-1 min-w-[160px] px-4 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground/40 transition-colors"
                  />
                  <button
                    onClick={() => void handleAdjust()}
                    disabled={
                      !adjustPts ||
                      Number.parseInt(adjustPts, 10) === 0 ||
                      isPending
                    }
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-primary-foreground text-xs tracking-[0.16em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-35"
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                    Áp dụng
                  </button>
                </div>
              </div>

              {account.history?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    Lịch sử ({account.history.length})
                  </p>
                  <div className="border border-border divide-y divide-border max-h-56 overflow-y-auto">
                    {account.history.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="text-foreground text-xs">
                            {entry.note ?? entry.type}
                          </p>
                          {entry.staffName && (
                            <p className="text-[10px] text-muted-foreground/70">
                              Nhân viên: {entry.staffName}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                            {new Date(entry.createdAt).toLocaleString("vi-VN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span
                          className={`font-semibold text-sm flex-shrink-0 ml-4 ${entry.points > 0 ? "text-green-600" : "text-red-500"}`}
                        >
                          {entry.points > 0 ? "+" : ""}
                          {entry.points}
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
                onChange={(event) => {
                  setListSearch(event.target.value);
                  setListPage(1);
                }}
                placeholder="Tìm tên, SĐT..."
                className="pl-9 pr-4 py-2 text-xs bg-background border border-border outline-none focus:border-foreground/40 transition-colors w-48"
              />
            </div>
            <button
              onClick={() => void refetchList()}
              disabled={listLoading}
              className="p-2 border border-border hover:bg-secondary/50 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-muted-foreground ${listLoading ? "animate-spin" : ""}`}
              />
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
                  {[
                    "Tên",
                    "Điện thoại",
                    "Điểm",
                    "Trạng thái",
                    "Ngày tạo",
                    "",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-5 py-3 text-left text-[10px] tracking-[0.14em] uppercase text-muted-foreground font-medium"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-muted-foreground text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  accounts.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setPhone(item.phone);
                        setAccount(null);
                        setNotFound(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        void lookupByPhone(item.phone)
                          .then(setAccount)
                          .catch(() => undefined);
                      }}
                    >
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {item.customerName ?? (
                          <span className="italic text-muted-foreground">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {item.phone}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5">
                          <Star
                            className="w-3.5 h-3.5 fill-current"
                            style={{ color: "hsl(var(--warm))" }}
                          />
                          <span className="font-medium text-foreground">
                            {item.totalPoints}
                          </span>
                          {minThreshold !== null &&
                            item.totalPoints >= minThreshold && (
                              <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 uppercase tracking-wider">
                                Đủ ĐK
                              </span>
                            )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            item.isActive === false
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.isActive === false
                            ? "Đã khóa"
                            : "Đang hoạt động"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeactivateAccount(item.phone);
                          }}
                          disabled={
                            deactivateAccountMut.isPending ||
                            item.isActive === false
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] border border-red-200 rounded-md text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {listMeta && listMeta.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Trang {listMeta.page} / {listMeta.totalPages} · {listMeta.total}{" "}
              kết quả
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setListPage((prev) => Math.max(1, prev - 1))}
                disabled={listPage === 1 || listLoading}
                className="px-3 py-1.5 border border-border hover:bg-secondary/50 disabled:opacity-40 transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setListPage((prev) => Math.min(listMeta.totalPages, prev + 1))
                }
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
