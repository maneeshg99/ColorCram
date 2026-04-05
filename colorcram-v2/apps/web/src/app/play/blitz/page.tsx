"use client";

import { useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PreGameScreen } from "@/components/game/PreGameScreen";

export default function BlitzPage() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <PreGameScreen mode="blitz" onStart={() => setStarted(true)} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <GameBoard mode="blitz" difficulty="medium" />
    </div>
  );
}
