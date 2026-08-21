"use client";

import { motion } from "motion/react";

import type { LayerPart } from "@/game/kit";

export interface BackdropPart extends LayerPart {
  type: "backdrop";
}

const BLOBS = [
  {
    style: {
      left: "-10%",
      top: "-20%",
      width: "70%",
      height: "90%",
      background:
        "radial-gradient(circle, rgba(112,86,255,0.55) 0%, rgba(112,86,255,0) 70%)",
    },
    duration: 14,
  },
  {
    style: {
      right: "-15%",
      top: "10%",
      width: "75%",
      height: "100%",
      background:
        "radial-gradient(circle, rgba(0,168,255,0.42) 0%, rgba(0,168,255,0) 70%)",
    },
    duration: 18,
  },
  {
    style: {
      left: "25%",
      bottom: "-35%",
      width: "60%",
      height: "80%",
      background:
        "radial-gradient(circle, rgba(255,88,158,0.28) 0%, rgba(255,88,158,0) 70%)",
    },
    duration: 22,
  },
];

export function BackdropView() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #141a3d 0%, #0b0d22 45%, #05060f 100%)",
      }}
    >
      {BLOBS.map((blob, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={blob.style}
          animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1] }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
