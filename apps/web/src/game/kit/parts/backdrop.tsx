"use client";

import { motion } from "motion/react";

import type { LayerPart } from "../layer";

export interface BackdropPart extends LayerPart {
  type: "backdrop";
  from?: string;
  mid?: string;
  to?: string;
  halos?: string[];
}

const SPOTS = [
  { left: "-10%", top: "-20%", width: "70%", height: "90%", duration: 14 },
  { right: "-15%", top: "10%", width: "75%", height: "100%", duration: 18 },
  { left: "25%", bottom: "-35%", width: "60%", height: "80%", duration: 22 },
];

const PEAK = [0.5, 0.42, 0.32];

export function BackdropView({ part }: { part: BackdropPart }) {
  const {
    from = "#ffffff",
    mid = "#eef2fb",
    to = "#dde5f5",
    halos = ["150,130,255", "90,190,255", "255,150,190"],
  } = part;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${from} 0%, ${mid} 45%, ${to} 100%)`,
      }}
    >
      {halos.slice(0, SPOTS.length).map((halo, index) => {
        const { duration, ...spot } = SPOTS[index];
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              ...spot,
              background: `radial-gradient(circle, rgba(${halo},${PEAK[index]}) 0%, rgba(${halo},0) 70%)`,
            }}
            animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1] }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 55%), radial-gradient(ellipse at 50% 45%, rgba(30,40,80,0) 55%, rgba(30,40,80,0.18) 100%)",
        }}
      />
    </div>
  );
}
