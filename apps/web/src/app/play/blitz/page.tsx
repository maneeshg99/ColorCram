"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PreGameScreen } from "@/components/game/PreGameScreen";

const GameBoard = dynamic(
  () => import("@/components/game/GameBoard").then((m) => ({ default: m.GameBoard })),
  { ssr: false }
);

export default function BlitzPage() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <PreGameScreen mode="blitz" onStart={() => setStarted(true)} />;
  }

  return (
    <GameBoard mode="blitz" difficulty="medium" onExit={() => setStarted(false)} />
  );
}
