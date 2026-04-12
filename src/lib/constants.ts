import type { BusinessInfo } from "./types";

// ── King Nails Brand Info ──
export const BUSINESS: BusinessInfo = {
  name: "KING NAILS",
  tagline: "There's Nothing a Fresh Manicure Cannot Fix",
  phone: "07482 888 999",
  email: "kingnails.co.uk@gmail.com",
  address: ["184 Whitchurch Rd,", "Cardiff CF14 3JP"],
  mapUrl: "https://maps.app.goo.gl/qAQXwwNKWqHKELEg8",
  instagram: "https://www.instagram.com/kingnails.cardiff/",
  facebook: "https://www.facebook.com/KingNailsCardiff",
  hours: [
    { label: "Mon – Sat", time: "9:00am – 6:30pm" },
    { label: "Thursday", time: "9:00am – 7:00pm" },
    { label: "Sunday", time: "9:30am – 5:00pm" },
  ],
};

export const BOOKING_URL = "/book-appointment";
