export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  service: string;
  price: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  staff: string;
  status: BookingStatus;
  notes?: string;
  pointsAwarded: boolean;
  createdAt: string;   // ISO
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  totalBookings: number;
  joinedAt: string;    // ISO
}

export interface PointTransaction {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  delta: number;         // positive = add, negative = deduct
  reason: string;
  adminNote?: string;
  createdAt: string;     // ISO
}
