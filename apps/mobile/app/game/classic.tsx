import { useState } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { PreGameScreen } from "@/components/game/PreGameScreen";
import type { Difficulty } from "@colorcram-v2/types";

export default function ClassicGame() {
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  if (!started) {
    return (
      <PreGameScreen
        mode="classic"
        title="Classic"
        description="Memorize a color, then recreate it from memory. Test your color perception at your own pace."
        onStart={(diff) => {
          setDifficulty((diff as Difficulty) ?? "easy");
          setStarted(true);
        }}
      />
    );
  }

  return <GameBoard mode="classic" difficulty={difficulty} />;
}
