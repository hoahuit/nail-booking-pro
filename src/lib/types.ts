// ── Domain types for the entire app ──

export type ServiceItem = {
  id: string;
  name: string;
  price: string;
  duration: string;
  image: string;
  categoryKey: string;
};

export type ServiceCategory = {
  key: string;
  label: string;
  items: ServiceItem[];
};

export type StaffMember = {
  id: string;
  name: string;
  avatar?: string;
  available: boolean;
};

export type BookingPayload = {
  service: ServiceItem;
  date: string;        // ISO string
  time: string;        // HH:mm
  staffId: string;     // "any" | staff.id
  note: string;
  customer: CustomerInfo;
  voucherCode?: string;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
};

export type Booking = BookingPayload & {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  totalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
  voucherId?: string
};

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  label: string;
  span?: string;
};

export type BusinessInfo = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string[];
  mapUrl: string;
  instagram: string;
  facebook: string;
  hours: { label: string; time: string }[];
};
