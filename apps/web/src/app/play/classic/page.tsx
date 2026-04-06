"use client";

import { useState } from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PreGameScreen } from "@/components/game/PreGameScreen";
import type { Difficulty } from "@colorcram-v2/types";

const GameBoard = dynamic(
  () => import("@/components/game/GameBoard").then((m) => ({ default: m.GameBoard })),
  { ssr: false }
);

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
    <GameBoard
      mode="classic"
      difficulty={difficulty}
      onExit={() => setDifficulty(null)}
    />
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
