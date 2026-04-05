"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import type { Difficulty } from "@colorcram-v2/types";

function ClassicGame() {
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get("difficulty") || "easy") as Difficulty;

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
