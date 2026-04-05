"use client";

import { GameBoard } from "@/components/game/GameBoard";

export default function GradientPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <GameBoard mode="gradient" difficulty="medium" />
    </div>
  );
}
