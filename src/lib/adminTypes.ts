// API status values from backend (uppercase)
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface ApiBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  serviceId: string;
  staffId: string | null;
  startTime: string;   // ISO
  endTime: string;     // ISO
  duration: number;    // minutes
  totalPrice: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  service: { name: string; category: string };
  staff: { name: string } | null;
  user: { name: string; email: string } | null;
}

// ── Legacy shape kept for AdminPoints (mock data) ──────────────────────────────
export type LegacyBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  service: string;
  price: string;
  date: string;
  time: string;
  staff: string;
  status: LegacyBookingStatus;
  notes?: string;
  pointsAwarded: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  totalBookings: number;
  joinedAt: string;
}

export interface PointTransaction {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  delta: number;
  reason: string;
  adminNote?: string;
  createdAt: string;
}

