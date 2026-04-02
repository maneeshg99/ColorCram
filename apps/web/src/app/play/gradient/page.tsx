"use client";

import { GameBoard } from "@/components/game/GameBoard";

export default function GradientPage() {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="text-center mb-4">
        <h1 className="text-lg font-[800] tracking-tight">Gradient Mode</h1>
        <p className="text-[var(--text-caption)] text-[var(--fg-muted)]">
          Recreate both endpoints of the gradient
        </p>
      </div>
      <GameBoard mode="gradient" difficulty="medium" />
    </div>
  );
}
