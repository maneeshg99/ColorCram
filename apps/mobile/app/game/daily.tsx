import { useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PreGameScreen } from "@/components/game/PreGameScreen";

export default function DailyGame() {
  const [started, setStarted] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  if (!started) {
    return (
      <PreGameScreen
        mode="daily"
        title="Daily"
        description="Same colors for everyone, every day. One shot to prove your skills."
        onStart={() => setStarted(true)}
      />
    );
  }

  return <GameBoard mode="daily" difficulty="medium" seed={today} />;
}
