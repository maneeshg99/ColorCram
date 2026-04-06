"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PreGameScreen } from "@/components/game/PreGameScreen";

const GameBoard = dynamic(
  () => import("@/components/game/GameBoard").then((m) => ({ default: m.GameBoard })),
  { ssr: false }
);

export default function GradientPage() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <PreGameScreen mode="gradient" onStart={() => setStarted(true)} />;
  }

  return (
    <GameBoard mode="gradient" difficulty="medium" onExit={() => setStarted(false)} />
  );
}
