import { GameBoard } from "@/components/game/GameBoard";

export default function DailyGame() {
  const today = new Date().toISOString().split("T")[0];
  return <GameBoard mode="daily" difficulty="medium" seed={today} />;
}
