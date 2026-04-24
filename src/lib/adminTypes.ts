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
  discountAmount: string | null;
  finalPrice: string | null;
  voucherId: string | null;
  status: BookingStatus;
  notes: string | null;
  designImage: string | null;
  createdAt: string;
  updatedAt: string;
  service: { name: string; category: string } | null;
  staff: { name: string } | null;
  items?: {
    service: { name: string; category: string } | null;
    staff: { name: string } | null;
    startTime: string;
    endTime: string;
    price: number;
  }[];
  user: { name: string; email: string } | null;
}

export interface ApiDayOff {
  id: string;
  date: string;
  reason: string | null;
  createdAt?: string;
  updatedAt?: string;
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

export type VoucherType = "PERCENT" | "FIXED";

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;          // % or £
  minOrder?: number;      // min spend to apply
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;     // ISO or undefined = no expiry
  createdAt: string;
}

