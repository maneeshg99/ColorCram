"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PreGameScreen } from "@/components/game/PreGameScreen";
import type { Difficulty } from "@colorcram-v2/types";

function ClassicGame() {
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get("difficulty") || "easy") as Difficulty;
  const [started, setStarted] = useState(false);

  if (!started) {
    return <PreGameScreen mode="classic" difficulty={difficulty} onStart={() => setStarted(true)} />;
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
