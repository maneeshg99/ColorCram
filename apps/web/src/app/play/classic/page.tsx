"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import type { Difficulty } from "@colorguesser/types";

function ClassicGame() {
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get("difficulty") || "medium") as Difficulty;

  return (
    <div className="flex flex-col items-center py-8">
      <GameBoard mode="classic" difficulty={difficulty} />
    </div>
  );
}

export default function ClassicPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16">Loading...</div>}>
      <ClassicGame />
    </Suspense>
  );
}
