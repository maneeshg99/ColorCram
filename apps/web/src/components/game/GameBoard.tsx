"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useGameStore } from "@/hooks/useGame";
import { ScreenTransition } from "@/components/design-system/ScreenTransition";
import { MemorizeScreen } from "./MemorizeScreen";
import { GuessScreen } from "./GuessScreen";
import { ResultScreen } from "./ResultScreen";
import { SummaryScreen } from "./SummaryScreen";
import { BlitzClock } from "./BlitzClock";
import { Modal, ModalHeader, ModalActions } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { BLITZ_DURATION_MS } from "@colorcram-v2/game-logic";
import type { GameMode, Difficulty } from "@colorcram-v2/types";
import { playSound } from "@/lib/sounds";

interface GameBoardProps {
  mode: GameMode;
  difficulty: Difficulty;
  seed?: string;
  onExit?: () => void;
}

export function GameBoard({ mode, difficulty, seed, onExit }: GameBoardProps) {
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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

  const handleMemorizeComplete = useCallback(() => {
    playSound("transition");
    beginGuess();
  }, [beginGuess]);

  const handleSubmitGuess = useCallback(() => {
    playSound("submit");
    if (mode === "gradient") {
      confirmGradientGuess();
    } else {
      confirmGuess();
    }
  }, [mode, confirmGuess, confirmGradientGuess]);

  const handleNextRound = useCallback(() => {
    playSound("transition");
    advance();
  }, [advance]);

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

  const showExit = onExit && state.phase !== "summary" && state.phase !== "idle";

  return (
    <>
    {/* Exit chip — rendered outside overflow container */}
    {showExit && (
      <button
        onClick={() => setShowExitConfirm(true)}
        style={{
          position: "fixed",
          bottom: "clamp(12px, 2vw, 20px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          background: "rgba(20, 20, 24, 0.7)",
          border: "1px solid var(--border-strong)",
          borderRadius: 999,
          padding: "7px 18px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          cursor: "pointer",
          transition: "color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--fg)";
          e.currentTarget.style.borderColor = "var(--border-focus)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--fg-muted)";
          e.currentTarget.style.borderColor = "var(--border-strong)";
        }}
      >
        Exit
      </button>
    )}

    {/* Exit confirmation */}
    <Modal
      open={showExitConfirm}
      onClose={() => setShowExitConfirm(false)}
      labelledBy="exit-confirm-title"
    >
      <ModalHeader
        id="exit-confirm-title"
        title="Quit this game?"
        description="You'll lose all progress in this round."
      />
      <ModalActions>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExitConfirm(false)}
        >
          Keep playing
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setShowExitConfirm(false);
            onExit?.();
          }}
        >
          Quit
        </Button>
      </ModalActions>
    </Modal>

    <div style={{ position: "relative", height: "100dvh", overflow: "hidden" }}>
      {/* Persistent blitz clock overlay */}
      {isBlitz && state.timeRemainingMs !== null && state.phase !== "summary" && (
        <div
          style={{
            position: "fixed",
            top: "clamp(16px, 2vw, 24px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
          }}
        >
          <BlitzClock
            timeRemainingMs={state.timeRemainingMs}
            totalTimeMs={BLITZ_DURATION_MS}
          />
        </div>
      )}

      <ScreenTransition phase={`${state.phase}-${state.currentRound}`}>
        {/* MEMORIZE */}
        {state.phase === "memorize" && (target || gradientTarget) && (
          <MemorizeScreen
            color={target ?? { h: 0, s: 0, b: 50 }}
            round={state.currentRound + 1}
            totalRounds={isBlitz ? state.currentRound + 1 : state.totalRounds}
            timeMs={state.memorizeTimeMs}
            totalTimeMs={state.memorizeTimeMs}
            onComplete={handleMemorizeComplete}
            gradient={
              isGradient && gradientTarget
                ? gradientTarget
                : undefined
            }
          />
        )}

        {/* GUESS */}
        {state.phase === "guess" && (
          <GuessScreen
            round={state.currentRound + 1}
            totalRounds={isBlitz ? state.currentRound + 1 : state.totalRounds}
            guess={currentGuess}
            onGuessChange={setGuess}
            onSubmit={handleSubmitGuess}
            isGradient={isGradient}
            guessStart={currentGuessStart}
            guessEnd={currentGuessEnd}
            onGuessStartChange={setGuessStart}
            onGuessEndChange={setGuessEnd}
          />
        )}

        {/* REVEAL */}
        {state.phase === "reveal" && (
          (() => {
            const score = isGradient
              ? currentGradientRound?.score
              : currentRoundData?.score;
            const isLastRound = !isBlitz && state.currentRound + 1 >= state.totalRounds;

            if (isGradient && currentGradientRound?.guessStart && currentGradientRound?.guessEnd) {
              return (
                <ResultScreen
                  target={currentGradientRound.targetStart}
                  guess={currentGradientRound.guessStart}
                  score={score ?? 0}
                  round={state.currentRound + 1}
                  totalRounds={state.totalRounds}
                  onNext={handleNextRound}
                  isGradient={true}
                  targetStart={currentGradientRound.targetStart}
                  targetEnd={currentGradientRound.targetEnd}
                  guessStart={currentGradientRound.guessStart}
                  guessEnd={currentGradientRound.guessEnd}
                  isLastRound={isLastRound}
                />
              );
            }

            if (target && currentRoundData?.guess) {
              return (
                <ResultScreen
                  target={target}
                  guess={currentRoundData.guess}
                  score={score ?? 0}
                  round={state.currentRound + 1}
                  totalRounds={isBlitz ? state.currentRound + 1 : state.totalRounds}
                  onNext={handleNextRound}
                  isLastRound={isLastRound}
                />
              );
            }

            return null;
          })()
        )}

        {/* SUMMARY */}
        {state.phase === "summary" && results && (
          <SummaryScreen
            results={results}
            mode={state.mode}
            difficulty={state.difficulty}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </ScreenTransition>
    </div>
    </>
  );
}
