"use client";

import { GameBoard } from "@/components/game/GameBoard";

export default function BlitzPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <GameBoard mode="blitz" difficulty="medium" />
    </div>
  );
}
