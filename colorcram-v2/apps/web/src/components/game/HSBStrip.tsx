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
      e.preventDefault();
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      computePosition(e.pageY);
    },
    [computePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      e.preventDefault();
      computePosition(e.pageY);
    },
    [dragging, computePosition]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const displayValue = Math.round(position * 100);

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
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
          width: 48,
          height: "clamp(160px, 45vh, 400px)",
          borderRadius: 24,
          background: gradient,
          cursor: dragging ? "grabbing" : "pointer",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Bar-style handle */}
        <motion.div
          style={{
            position: "absolute",
            left: 3,
            right: 3,
            top: `${position * 100}%`,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#ffffff",
            transform: "translateY(-50%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.2)",
            pointerEvents: "none",
          }}
          animate={{
            height: dragging ? 10 : 8,
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
