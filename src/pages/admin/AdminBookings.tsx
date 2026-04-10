import { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Star,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { mockBookings, mockCustomers } from "@/lib/mockAdminData";
import type { Booking, BookingStatus, Customer } from "@/lib/adminTypes";

const STATUS_TABS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusColors: Record<BookingStatus, string> = {
  pending:   "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

const POINTS_PER_BOOKING = 10;

const AdminBookings = () => {
  const [bookings,  setBookings]  = useLocalStorage<Booking[]>("admin_bookings",  mockBookings);
  const [customers, setCustomers] = useLocalStorage<Customer[]>("admin_customers", mockCustomers);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bookings
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            b.customerName.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.service.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, statusFilter, search]);

  const tabCount = (key: BookingStatus | "all") =>
    key === "all"
      ? bookings.length
      : bookings.filter((b) => b.status === key).length;

  const updateStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(`Booking marked as ${status}`);
  };

  const awardPoints = (booking: Booking) => {
    if (booking.pointsAwarded) {
      toast.info("Points already awarded for this booking");
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, pointsAwarded: true } : b))
    );
    setCustomers((prev) => {
      const exists = prev.find((c) => c.phone === booking.phone);
      if (exists) {
        return prev.map((c) =>
          c.phone === booking.phone
            ? { ...c, points: c.points + POINTS_PER_BOOKING, totalBookings: c.totalBookings + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          id: `c${Date.now()}`,
          name: booking.customerName,
          phone: booking.phone,
          email: booking.email,
          points: POINTS_PER_BOOKING,
          totalBookings: 1,
          joinedAt: new Date().toISOString(),
        },
      ];
    });
    toast.success(`+${POINTS_PER_BOOKING} pts awarded to ${booking.customerName}`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground font-light">
          {bookings.length} total · {bookings.filter((b) => b.status === "pending").length} pending
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or service…"
          className="w-full pl-11 pr-4 py-3 text-sm bg-card border border-border outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`relative flex-shrink-0 px-4 py-3.5 text-[10px] tracking-[0.12em] uppercase font-medium transition-colors ${
              statusFilter === t.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-[9px] opacity-60">({tabCount(t.key)})</span>
            {statusFilter === t.key && (
              <motion.div
                layoutId="booking-tab"
                className="absolute bottom-0 inset-x-0 h-[2px] bg-foreground"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                {["ID", "Customer", "Phone", "Service", "Date", "Time", "Price", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left text-[10px] tracking-[0.14em] uppercase text-muted-foreground font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-muted-foreground text-sm">
                    No bookings found
                  </td>
                </tr>
              )}
              {filtered.map((b, i) => (
                <>
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className={`hover:bg-secondary/30 transition-colors cursor-pointer ${
                      expandedId === b.id ? "bg-secondary/20" : ""
                    }`}
                    onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                  >
                    <td className="px-4 py-4 text-muted-foreground text-xs font-mono">
                      #{b.id}
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
                      {b.customerName}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                      {b.phone}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground max-w-[160px] truncate">
                      {b.service}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                      {b.date}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{b.time}</td>
                    <td className="px-4 py-4 font-medium text-foreground">{b.price}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border ${statusColors[b.status]}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        {b.status === "pending" && (
                          <button
                            onClick={() => updateStatus(b.id, "confirmed")}
                            title="Confirm booking"
                            className="p-2 hover:bg-blue-50 text-blue-500 rounded transition-colors"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(b.status === "pending" || b.status === "confirmed") && (
                          <button
                            onClick={() => updateStatus(b.id, "completed")}
                            title="Mark completed"
                            className="p-2 hover:bg-green-50 text-green-500 rounded transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {b.status === "completed" && (
                          <button
                            onClick={() => awardPoints(b)}
                            title={b.pointsAwarded ? "Points already awarded" : "Award 10 points"}
                            className={`p-2 rounded transition-colors ${
                              b.pointsAwarded
                                ? "text-muted-foreground/30 cursor-not-allowed"
                                : "hover:bg-amber-50 text-amber-500"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${b.pointsAwarded ? "fill-muted-foreground/30" : ""}`}
                            />
                          </button>
                        )}
                        {b.status !== "cancelled" && b.status !== "completed" && (
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            title="Cancel booking"
                            className="p-2 hover:bg-red-50 text-red-400 rounded transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                          className="p-2 text-muted-foreground/50 hover:text-muted-foreground rounded transition-colors"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${expandedId === b.id ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded detail row */}
                  {expandedId === b.id && (
                    <tr key={`${b.id}-expand`} className="bg-secondary/20">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                              Email
                            </p>
                            <p className="text-foreground">{b.email || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                              Staff Preference
                            </p>
                            <p className="text-foreground capitalize">{b.staff}</p>
                          </div>
                          <div>
                            <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                              Points
                            </p>
                            <p className="text-foreground">
                              {b.pointsAwarded ? "✓ 10 pts awarded" : "Not yet awarded"}
                            </p>
                          </div>
                          {b.notes && (
                            <div className="sm:col-span-3">
                              <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                                Customer Notes
                              </p>
                              <p className="text-foreground italic">"{b.notes}"</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1">
                              Created At
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(b.createdAt).toLocaleString("en-GB")}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
