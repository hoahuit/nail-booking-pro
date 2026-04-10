import type { ServiceCategory } from "../types";

import imgOverlay from "@/assets/service-acrylic-overlay.jpg";
import imgFrench from "@/assets/service-french-tips.jpg";
import imgGel from "@/assets/service-gel-colour.jpg";
import imgGlitter from "@/assets/service-glitter.jpg";
import imgBiab from "@/assets/service-biab.jpg";
import imgChrome from "@/assets/service-chrome.jpg";
import imgPedicure from "@/assets/service-pedicure.jpg";
import imgManicure from "@/assets/service-manicure.jpg";

// ── All services structured for the front end & future API ──
// When backend is ready, replace this with an API call in hooks/useServices.ts

let _id = 0;
const sid = (cat: string) => `${cat}-${++_id}`;

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    key: "fullset",
    label: "NAILS EXT · FULL SET",
    items: [
      { id: sid("fs"), name: "Acrylics Only", price: "£30", duration: "45m", image: imgOverlay, categoryKey: "fullset" },
      { id: sid("fs"), name: "Acrylics & Gel Colour", price: "£38", duration: "45m", image: imgGel, categoryKey: "fullset" },
      { id: sid("fs"), name: "Acrylics & Gel Colour French Tips", price: "£45", duration: "45m", image: imgFrench, categoryKey: "fullset" },
      { id: sid("fs"), name: "Ombre", price: "£40", duration: "45m", image: imgFrench, categoryKey: "fullset" },
      { id: sid("fs"), name: "Glitter Powder", price: "£45", duration: "45m", image: imgGlitter, categoryKey: "fullset" },
      { id: sid("fs"), name: "BIAB On Natural", price: "£35", duration: "40m", image: imgBiab, categoryKey: "fullset" },
      { id: sid("fs"), name: "BIAB With Extensions", price: "£40", duration: "50m", image: imgBiab, categoryKey: "fullset" },
      { id: sid("fs"), name: "BIAB & Gel Colour French Tips", price: "£45", duration: "50m", image: imgFrench, categoryKey: "fullset" },
      { id: sid("fs"), name: "Toes Acrylics & Gel Colour", price: "£35", duration: "40m", image: imgPedicure, categoryKey: "fullset" },
      { id: sid("fs"), name: "2 Big Toes", price: "£10", duration: "15m", image: imgPedicure, categoryKey: "fullset" },
    ],
  },
  {
    key: "infill",
    label: "NAILS EXT · INFILL",
    items: [
      { id: sid("if"), name: "Acrylics Only", price: "£25", duration: "40m", image: imgOverlay, categoryKey: "infill" },
      { id: sid("if"), name: "Acrylics & Gel Colour", price: "£30", duration: "45m", image: imgGel, categoryKey: "infill" },
      { id: sid("if"), name: "Acrylics & Gel Colour French Tips", price: "£35", duration: "45m", image: imgFrench, categoryKey: "infill" },
      { id: sid("if"), name: "Ombre", price: "£30", duration: "45m", image: imgFrench, categoryKey: "infill" },
      { id: sid("if"), name: "Glitter Powder", price: "£35", duration: "45m", image: imgGlitter, categoryKey: "infill" },
      { id: sid("if"), name: "BIAB On Natural", price: "£30", duration: "40m", image: imgBiab, categoryKey: "infill" },
      { id: sid("if"), name: "BIAB With Extensions", price: "£30", duration: "40m", image: imgBiab, categoryKey: "infill" },
      { id: sid("if"), name: "BIAB & Gel Colour French Tips", price: "£35", duration: "45m", image: imgFrench, categoryKey: "infill" },
      { id: sid("if"), name: "Toes Acrylics & Gel Colour", price: "£30", duration: "35m", image: imgPedicure, categoryKey: "infill" },
      { id: sid("if"), name: "2 Big Toes", price: "£5", duration: "10m", image: imgPedicure, categoryKey: "infill" },
    ],
  },
  {
    key: "takeoff",
    label: "NAILS EXT · T/O NEW SET",
    items: [
      { id: sid("to"), name: "Acrylics Only", price: "£35", duration: "60m", image: imgOverlay, categoryKey: "takeoff" },
      { id: sid("to"), name: "Acrylics & Gel Colour", price: "£43", duration: "60m", image: imgGel, categoryKey: "takeoff" },
      { id: sid("to"), name: "Acrylics & Gel Colour French Tips", price: "£48", duration: "60m", image: imgFrench, categoryKey: "takeoff" },
      { id: sid("to"), name: "Ombre", price: "£45", duration: "60m", image: imgFrench, categoryKey: "takeoff" },
      { id: sid("to"), name: "Glitter Powder", price: "£48", duration: "60m", image: imgGlitter, categoryKey: "takeoff" },
      { id: sid("to"), name: "BIAB On Natural", price: "£35", duration: "50m", image: imgBiab, categoryKey: "takeoff" },
      { id: sid("to"), name: "BIAB With Extensions", price: "£40", duration: "55m", image: imgBiab, categoryKey: "takeoff" },
      { id: sid("to"), name: "BIAB & Gel Colour French Tips", price: "£45", duration: "55m", image: imgFrench, categoryKey: "takeoff" },
      { id: sid("to"), name: "Toes Acrylics & Gel Colour", price: "£40", duration: "45m", image: imgPedicure, categoryKey: "takeoff" },
    ],
  },
  {
    key: "natural",
    label: "NATURAL NAILS",
    items: [
      { id: sid("nn"), name: "Basic Pedicure", price: "£40", duration: "40m", image: imgPedicure, categoryKey: "natural" },
      { id: sid("nn"), name: "Luxury Pedicure", price: "£45", duration: "50m", image: imgPedicure, categoryKey: "natural" },
      { id: sid("nn"), name: "Basic Manicure", price: "£30", duration: "30m", image: imgManicure, categoryKey: "natural" },
      { id: sid("nn"), name: "Luxury Manicure", price: "£35", duration: "45m", image: imgManicure, categoryKey: "natural" },
      { id: sid("nn"), name: "Gel Polish Hands", price: "£20", duration: "30m", image: imgGel, categoryKey: "natural" },
      { id: sid("nn"), name: "Gel Polish Toes", price: "£20", duration: "30m", image: imgPedicure, categoryKey: "natural" },
      { id: sid("nn"), name: "Kids Nails", price: "£10", duration: "20m", image: imgManicure, categoryKey: "natural" },
    ],
  },
  {
    key: "extra",
    label: "EXTRA",
    items: [
      { id: sid("ex"), name: "Chrome", price: "£5", duration: "10m", image: imgChrome, categoryKey: "extra" },
      { id: sid("ex"), name: "Cateyes", price: "£5", duration: "10m", image: imgChrome, categoryKey: "extra" },
      { id: sid("ex"), name: "Designs", price: "£5–£10", duration: "15m", image: imgGlitter, categoryKey: "extra" },
      { id: sid("ex"), name: "Diamonds", price: "£2–£5", duration: "10m", image: imgGlitter, categoryKey: "extra" },
      { id: sid("ex"), name: "Take Off Acrylics / BIAB", price: "£10", duration: "20m", image: imgOverlay, categoryKey: "extra" },
      { id: sid("ex"), name: "Take Off Gel Polish", price: "£5", duration: "15m", image: imgGel, categoryKey: "extra" },
    ],
  },
];

export const POPULAR_SERVICES = new Set([
  "Acrylics & Gel Colour French Tips",
  "BIAB & Gel Colour French Tips",
  "Luxury Manicure",
  "Luxury Pedicure",
]);
