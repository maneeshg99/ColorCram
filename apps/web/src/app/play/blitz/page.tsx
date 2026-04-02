"use client";

import { GameBoard } from "@/components/game/GameBoard";

export default function BlitzPage() {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Blitz Mode</h1>
        <p className="text-[var(--muted)] mt-1">60 seconds. Go fast.</p>
      </div>
      <GameBoard mode="blitz" difficulty="medium" />
    </div>
  );
}
