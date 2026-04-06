import { useLocalSearchParams } from "expo-router";
import { GameBoard } from "@/components/game/GameBoard";
import type { Difficulty } from "@colorcram-v2/types";

export default function ClassicGame() {
  const { difficulty = "easy" } = useLocalSearchParams<{ difficulty?: string }>();
  return <GameBoard mode="classic" difficulty={difficulty as Difficulty} />;
}
