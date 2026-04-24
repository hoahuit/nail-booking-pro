// ── Domain types for the entire app ──

export type ServiceItem = {
  id: string;
  name: string;
  price: string;      // base price string e.g. "£10" — used for parseMoney()
  priceMax?: string | null; // max price string e.g. "£20", or null for fixed price
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

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
};

/** Single service line in a multi-service booking */
export type BookingServiceEntry = {
  service: ServiceItem;
  /** "any" means let the system assign staff */
  staffId: string;
};

/** Payload sent to createBookingApi */
export type MultiServiceBookingPayload = {
  services: BookingServiceEntry[];
  date: string;       // ISO string of chosen date
  time: string;       // HH:mm – start time of the first service
  note: string;
  customer: CustomerInfo;
  voucherCode?: string;
  designImage?: File;
};

/** Legacy single-service payload – kept for any existing admin utilities */
export type BookingPayload = {
  service: ServiceItem;
  date: string;
  time: string;
  staffId: string;
  note: string;
  customer: CustomerInfo;
  voucherCode?: string;
};

export type Booking = {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  totalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
  voucherId?: string;
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
