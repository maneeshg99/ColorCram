import { useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PreGameScreen } from "@/components/game/PreGameScreen";

export default function GradientGame() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <PreGameScreen
        mode="gradient"
        title="Gradient"
        description="Two colors, one smooth blend. Memorize the gradient and recreate both endpoints."
        onStart={() => setStarted(true)}
      />
    );
  }

  return <GameBoard mode="gradient" difficulty="medium" />;
}
