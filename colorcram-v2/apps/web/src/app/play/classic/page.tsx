"use client";

import { useState } from "react";
import { Suspense } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PreGameScreen } from "@/components/game/PreGameScreen";
import type { Difficulty } from "@colorcram-v2/types";

function ClassicGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  if (!difficulty) {
    return (
      <PreGameScreen
        mode="classic"
        onStart={(diff) => setDifficulty((diff as Difficulty) || "easy")}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <GameBoard mode="classic" difficulty={difficulty} />
    </div>
  );
}

export default function ClassicPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-[#adadad] text-sm">
          Loading...
        </div>
      }
    >
      <ClassicGame />
    </Suspense>
  );
}
