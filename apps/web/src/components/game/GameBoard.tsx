"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/hooks/useGame";
import { HSBColorPicker } from "./HSBColorPicker";
import { ColorDisplay } from "./ColorDisplay";
import { ColorComparison } from "./ColorComparison";
import { GradientDisplay } from "./GradientDisplay";
import { DualHSBPicker } from "./DualHSBPicker";
import { GradientComparison } from "./GradientComparison";
import { ScoreDisplay } from "./ScoreDisplay";
import { ScoreFeedback } from "./ScoreFeedback";
import { CountdownTimer } from "./CountdownTimer";
import { BlitzClock } from "./BlitzClock";
import { ScoreSubmitter } from "./ScoreSubmitter";
import { Button } from "@/components/ui/Button";
import { hsbToHex } from "@colorcram/color-utils";
import { BLITZ_DURATION_MS } from "@colorcram/game-logic";
import type { GameMode, Difficulty } from "@colorcram/types";

interface GameBoardProps {
  mode: GameMode;
  difficulty: Difficulty;
  seed?: string;
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function GameBoard({ mode, difficulty, seed }: GameBoardProps) {
  const {
    state,
    currentGuess,
    currentGuessStart,
    currentGuessEnd,
    newGame,
    beginMemorize,
    beginGuess,
    setGuess,
    setGuessStart,
    setGuessEnd,
    confirmGuess,
    confirmGradientGuess,
    advance,
    tickBlitz,
    getTarget,
    getGradientTarget,
    getGameResults,
  } = useGameStore();

  const initialized = useRef(false);
  const blitzStartRef = useRef<number | null>(null);

  // Initialize game
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      newGame(mode, difficulty, seed);
      queueMicrotask(() => {
        useGameStore.getState().state && beginMemorize();
      });
    }
  }, [mode, difficulty, seed, newGame, beginMemorize]);

  // Blitz timer loop
  const phase = state?.phase;
  useEffect(() => {
    if (mode !== "blitz") return;
    if (!phase || phase === "idle" || phase === "summary" || phase === "submitted") return;

    if (blitzStartRef.current === null) {
      blitzStartRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (blitzStartRef.current === null) return;
      tickBlitz(Date.now() - blitzStartRef.current);
    }, 100);

    return () => clearInterval(interval);
  }, [mode, phase, tickBlitz]);

  const handleMemorizeComplete = useCallback(() => beginGuess(), [beginGuess]);
  const handleSubmitGuess = useCallback(() => {
    if (mode === "gradient") {
      confirmGradientGuess();
    } else {
      confirmGuess();
    }
  }, [mode, confirmGuess, confirmGradientGuess]);
  const handleNextRound = useCallback(() => advance(), [advance]);

  const handlePlayAgain = useCallback(() => {
    blitzStartRef.current = null;
    initialized.current = false;
    newGame(mode, difficulty, seed);
    queueMicrotask(() => {
      initialized.current = true;
      beginMemorize();
    });
  }, [mode, difficulty, seed, newGame, beginMemorize]);

  if (!state) return null;

  const target = getTarget();
  const gradientTarget = getGradientTarget();
  const results = getGameResults();
  const currentRoundData = state.rounds[state.currentRound];
  const currentGradientRound = state.gradientRounds[state.currentRound];
  const isBlitz = state.mode === "blitz";
  const isGradient = state.mode === "gradient";

  return (
    <>
      {/* MEMORIZE */}
      {state.phase === "memorize" && (target || gradientTarget) && (
        <motion.div
          key={`memorize-${state.currentRound}`}
          {...fadeIn}
        >
          {isGradient && gradientTarget ? (
            <GradientDisplay
              startColor={gradientTarget.start}
              endColor={gradientTarget.end}
              variant="memorize"
            >
              <motion.div
                className="text-center text-[var(--text-caption)] text-[var(--fg-muted)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Round {state.currentRound + 1} / {state.totalRounds}
              </motion.div>
              <CountdownTimer
                durationMs={state.memorizeTimeMs}
                onComplete={handleMemorizeComplete}
                running={true}
              />
            </GradientDisplay>
          ) : (
            <ColorDisplay color={target!} variant="memorize">
              <motion.div
                className="text-center text-[var(--text-caption)] text-[var(--fg-muted)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Round {state.currentRound + 1} {!isBlitz && `/ ${state.totalRounds}`}
              </motion.div>
              {isBlitz && state.timeRemainingMs !== null && (
                <div className="mb-4">
                  <BlitzClock timeRemainingMs={state.timeRemainingMs} totalTimeMs={BLITZ_DURATION_MS} />
                </div>
              )}
              <CountdownTimer
                durationMs={state.memorizeTimeMs}
                onComplete={handleMemorizeComplete}
                running={true}
              />
            </ColorDisplay>
          )}
        </motion.div>
      )}

      {/* GUESS */}
      {state.phase === "guess" && (
        <motion.div
          key={`guess-${state.currentRound}`}
          className="flex flex-col items-center justify-center gap-4 px-6 min-h-[calc(100vh-3.5rem)] overflow-hidden"
          {...fadeIn}
        >
          {isBlitz && state.timeRemainingMs !== null && (
            <BlitzClock timeRemainingMs={state.timeRemainingMs} totalTimeMs={BLITZ_DURATION_MS} />
          )}

          <div className="text-center">
            <motion.div
              className="text-[var(--text-caption)] text-[var(--fg-muted)] mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Round {state.currentRound + 1} {!isBlitz && `/ ${state.totalRounds}`}
            </motion.div>
            <motion.h2
              className="text-[var(--text-heading)] font-[800] tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {isGradient ? "Recreate the gradient" : "Recreate the color"}
            </motion.h2>
          </div>

          {isGradient ? (
            <DualHSBPicker
              startValue={currentGuessStart}
              endValue={currentGuessEnd}
              onStartChange={setGuessStart}
              onEndChange={setGuessEnd}
            />
          ) : (
            <HSBColorPicker value={currentGuess} onChange={setGuess} />
          )}

          <Button onClick={handleSubmitGuess} size="lg">
            Submit Guess
          </Button>
        </motion.div>
      )}

      {/* REVEAL */}
      {state.phase === "reveal" && (
        <motion.div
          key={`reveal-${state.currentRound}`}
          className="flex flex-col items-center gap-6 py-8 px-6"
          {...fadeIn}
        >
          {isBlitz && state.timeRemainingMs !== null && (
            <BlitzClock timeRemainingMs={state.timeRemainingMs} totalTimeMs={BLITZ_DURATION_MS} />
          )}

          <motion.div
            className="text-[var(--text-caption)] text-[var(--fg-muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Round {state.currentRound + 1} {!isBlitz && `/ ${state.totalRounds}`}
          </motion.div>

          {isGradient && currentGradientRound?.guessStart && currentGradientRound?.guessEnd ? (
            <GradientComparison
              targetStart={currentGradientRound.targetStart}
              targetEnd={currentGradientRound.targetEnd}
              guessStart={currentGradientRound.guessStart}
              guessEnd={currentGradientRound.guessEnd}
            />
          ) : target && currentRoundData?.guess ? (
            <ColorComparison target={target} guess={currentRoundData.guess} />
          ) : null}

          {(() => {
            const score = isGradient ? currentGradientRound?.score : currentRoundData?.score;
            return score !== null && score !== undefined ? (
              <>
                <ScoreDisplay score={score} />
                <ScoreFeedback score={score} roundIndex={state.currentRound} />
              </>
            ) : null;
          })()}

          <Button onClick={handleNextRound} size="md">
            {!isBlitz && state.currentRound + 1 >= state.totalRounds
              ? "See Results"
              : "Next Round"}
          </Button>
        </motion.div>
      )}

      {/* SUMMARY */}
      {state.phase === "summary" && results && (
        <motion.div
          key="summary"
          className="flex flex-col items-center gap-10 py-12 px-6 max-w-lg mx-auto"
          {...fadeIn}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2 className="text-[var(--text-heading)] font-[900] tracking-tight mb-1">
              {isBlitz ? "Time\u2019s Up!" : "Game Over"}
            </h2>
            <p className="text-[var(--text-caption)] text-[var(--fg-muted)]">
              {results.rounds.length} round{results.rounds.length !== 1 ? "s" : ""} completed
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className={`grid ${isBlitz ? "grid-cols-3" : "grid-cols-1"} gap-6 text-center w-full max-w-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <div className="text-[var(--text-display)] font-[900] tabular-nums">
                {results.rounds.length > 0
                  ? Math.round(results.totalScore / results.rounds.length)
                  : 0}%
              </div>
              <div className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1">
                avg match
              </div>
            </div>
            {isBlitz && (
              <>
                <div>
                  <div className="text-[var(--text-display)] font-[900] tabular-nums">
                    {Math.max(...results.rounds.map((r) => r.score ?? 0))}%
                  </div>
                  <div className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1">
                    best round
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-display)] font-[900] tabular-nums">
                    {results.rounds.length > 0
                      ? (results.rounds.reduce((s, r) => s + (r.timeMs ?? 0), 0) / results.rounds.length / 1000).toFixed(1)
                      : 0}s
                  </div>
                  <div className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1">
                    avg time
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Round breakdown */}
          <motion.div
            className="w-full space-y-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.4 } },
            }}
          >
            {isGradient && results.gradientRounds
              ? results.gradientRounds.map((round, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)]"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <span className="text-xs text-[var(--fg-subtle)] w-5 font-mono">{i + 1}</span>
                    <div
                      className="w-20 h-6 rounded-md border border-[var(--border)] shrink-0"
                      style={{
                        background: `linear-gradient(to right, ${hsbToHex(round.targetStart)}, ${hsbToHex(round.targetEnd)})`,
                      }}
                    />
                    <span className="ml-auto text-sm font-[800] tabular-nums">{round.score}%</span>
                  </motion.div>
                ))
              : results.rounds.map((round, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)]"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <span className="text-xs text-[var(--fg-subtle)] w-5 font-mono">{i + 1}</span>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: hsbToHex(round.target),
                          clipPath: "polygon(0 0, 100% 0, 0 100%)",
                        }}
                      />
                      {round.guess && (
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: hsbToHex(round.guess),
                            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                          }}
                        />
                      )}
                    </div>
                    <span className="ml-auto text-sm font-[800] tabular-nums">{round.score}%</span>
                  </motion.div>
                ))}
          </motion.div>

          {/* Score submission */}
          <ScoreSubmitter results={results} />

          {/* Actions */}
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={handlePlayAgain}>Play Again</Button>
            <Button variant="secondary" onClick={() => (window.location.href = "/play")}>
              Change Mode
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
