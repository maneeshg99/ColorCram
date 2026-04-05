"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface HSBStripProps {
  label: string;
  colors: string[];
  position: number; // 0-1
  onDrag: (pos: number) => void;
}

export function HSBStrip({ label, colors, position, onDrag }: HSBStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const gradient = `linear-gradient(to bottom, ${colors.join(", ")})`;

  const computePosition = useCallback(
    (pageY: number) => {
      const el = stripRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const top = rect.top + scrollY;
      const relY = pageY - top;
      const clamped = Math.max(0, Math.min(1, relY / rect.height));
      onDrag(clamped);
    },
    [onDrag]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      computePosition(e.pageY);
    },
    [computePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      computePosition(e.pageY);
    },
    [dragging, computePosition]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Display value based on position
  const displayValue = Math.round(position * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: "#adadad",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>

      <div
        ref={stripRef}
        style={{
          position: "relative",
          width: 40,
          height: "70vh",
          maxHeight: 500,
          minHeight: 200,
          borderRadius: 20,
          background: gradient,
          cursor: dragging ? "grabbing" : "pointer",
          touchAction: "none",
          userSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Circular handle */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: `${position * 100}%`,
            width: 25,
            height: 25,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.2)",
            pointerEvents: "none",
          }}
          animate={{
            scale: dragging ? 1.15 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </div>

      <span
        style={{
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#adadad",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {displayValue}
      </span>
    </div>
  );
}
