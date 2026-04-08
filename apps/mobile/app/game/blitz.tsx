import { useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PreGameScreen } from "@/components/game/PreGameScreen";

export default function BlitzGame() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <PreGameScreen
        mode="blitz"
        title="Blitz"
        description="60 seconds on the clock. Memorize and guess as many colors as you can before time runs out."
        onStart={() => setStarted(true)}
      />
    );
  }

  return <GameBoard mode="blitz" difficulty="medium" />;
}
