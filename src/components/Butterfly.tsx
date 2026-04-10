import { motion } from "framer-motion";
import type { CSSProperties } from "react";

export interface ButterflyProps {
  /** Wing fill colour */
  color?: string;
  /** Lower-wing fill (defaults to color) */
  secondaryColor?: string;
  /** SVG logical size in px */
  size?: number;
  /** CSS left offset (absolute positioning) */
  left?: string | number;
  /** CSS top offset */
  top?: string | number;
  /** x keyframes relative to starting position */
  pathX?: number[];
  /** y keyframes relative to starting position */
  pathY?: number[];
  /** rotation keyframes (deg) */
  pathRotate?: number[];
  /** animation start delay in seconds */
  delay?: number;
  /** wing flap cycle duration in seconds */
  flapSpeed?: number;
  /** flight path loop duration in seconds */
  pathDuration?: number;
  /** overall opacity */
  opacity?: number;
  style?: CSSProperties;
}

const Butterfly = ({
  color = "#e879f9",
  secondaryColor,
  size = 64,
  left = 0,
  top = 0,
  pathX = [0, 60, 20, 80, 10, 0],
  pathY = [0, -30, 15, -20, 30, 0],
  pathRotate = [0, 8, -6, 10, -5, 0],
  delay = 0,
  flapSpeed = 0.5,
  pathDuration = 14,
  opacity = 0.72,
  style,
}: ButterflyProps) => {
  const sc = secondaryColor ?? color;
  const times = pathX.map((_, i) => i / (pathX.length - 1));

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left, top, ...style }}
      animate={{ x: pathX, y: pathY, rotate: pathRotate }}
      transition={{
        duration: pathDuration,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        times,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="-55 -55 110 110"
        overflow="visible"
        style={{
          opacity,
          filter: `drop-shadow(0 0 7px ${color}90) drop-shadow(0 0 14px ${color}40)`,
        }}
        aria-hidden
      >
        {/* ─── Left wings ─── */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "right center" }}
          animate={{ scaleX: [1, 0.05, 1] }}
          transition={{
            duration: flapSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        >
          {/* upper-left */}
          <path
            d="M0,-3 Q-30,-50 -70,-20 Q-80,10 -46,26 Q-18,36 0,-3Z"
            fill={color}
            opacity={0.92}
          />
          {/* lower-left */}
          <path
            d="M0,3 Q-24,22 -44,52 Q-32,64 -14,46 Q-3,30 0,3Z"
            fill={sc}
            opacity={0.82}
          />
          {/* shimmer vein */}
          <path
            d="M0,-3 Q-22,-34 -48,-22 Q-58,0 -38,16"
            fill="none"
            stroke="rgba(255,255,255,0.30)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </motion.g>

        {/* ─── Right wings (mirror) ─── */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "left center" }}
          animate={{ scaleX: [1, 0.05, 1] }}
          transition={{
            duration: flapSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        >
          {/* upper-right */}
          <path
            d="M0,-3 Q30,-50 70,-20 Q80,10 46,26 Q18,36 0,-3Z"
            fill={color}
            opacity={0.92}
          />
          {/* lower-right */}
          <path
            d="M0,3 Q24,22 44,52 Q32,64 14,46 Q3,30 0,3Z"
            fill={sc}
            opacity={0.82}
          />
          {/* shimmer vein */}
          <path
            d="M0,-3 Q22,-34 48,-22 Q58,0 38,16"
            fill="none"
            stroke="rgba(255,255,255,0.30)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </motion.g>

        {/* ─── Body ─── */}
        <ellipse cx="0" cy="10" rx="2.8" ry="18" fill={color} opacity={0.95} />
        {/* head */}
        <circle cx="0" cy="-6" r="3.5" fill={color} opacity={0.95} />

        {/* ─── Antennae ─── */}
        <motion.g
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "0 -8px" }}
        >
          <path
            d="M-1.5,-9 Q-9,-24 -12,-30"
            stroke={color}
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="-12" cy="-30" r="2.4" fill={color} />
          <path
            d="M1.5,-9 Q9,-24 12,-30"
            stroke={color}
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="12" cy="-30" r="2.4" fill={color} />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default Butterfly;
