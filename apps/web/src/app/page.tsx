"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center px-6 overflow-hidden">
      {/* Hero */}
      <div className="flex flex-col items-center gap-6 py-24 md:py-32 w-full">
        <h1 className="font-[900] tracking-tighter leading-[0.85] text-center w-full">
          <span className="block" style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}>
            {"Color".split("").map((char, i) => (
              <motion.span
                key={`a-${i}`}
                className="inline-block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: i * 0.03,
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
          <span className="block text-[var(--fg-muted)]" style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}>
            {"Guesser".split("").map((char, i) => (
              <motion.span
                key={`b-${i}`}
                className="inline-block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: (i + 5) * 0.03,
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          className="text-[var(--text-body)] text-[var(--fg-muted)] text-center max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Memorize colors. Recreate them from memory.
          <br />
          Find out how accurate your eyes really are.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link href="/play/classic?difficulty=easy">
            <Button size="lg">Play Now</Button>
          </Link>
        </motion.div>
      </div>

      {/* Mode cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-3xl mb-20"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.8 } },
        }}
      >
        <ModeCard
          title="Classic"
          description="Memorize and recreate at your own pace"
          href="/play/classic"
        />
        <ModeCard
          title="Daily"
          description="Same colors for everyone. One shot."
          href="/play/daily"
        />
        <ModeCard
          title="Blitz"
          description="60 seconds. As many as you can."
          href="/play/blitz"
        />
        <ModeCard
          title="Gradient"
          description="Recreate gradients, not just flats"
          href="/play/gradient"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-12 text-center py-12 border-t border-[var(--border)] w-full max-w-md mb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div>
          <div className="text-lg font-[800]">CIEDE2000</div>
          <div className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1">
            Perceptual scoring
          </div>
        </div>
        <div>
          <div className="text-lg font-[800]">4</div>
          <div className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1">
            Game modes
          </div>
        </div>
        <div>
          <div className="text-lg font-[800]">&infin;</div>
          <div className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1">
            Replayability
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ModeCard({
  title,
  description,
  href,
  comingSoon,
}: {
  title: string;
  description: string;
  href: string;
  comingSoon?: boolean;
}) {
  const content = (
    <motion.div
      className={`relative p-5 rounded-xl border border-[var(--border)] transition-colors h-full ${
        comingSoon
          ? "opacity-40"
          : "hover:border-[var(--fg-muted)] cursor-pointer"
      }`}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.95 },
        visible: { opacity: comingSoon ? 0.4 : 1, y: 0, scale: 1 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={comingSoon ? {} : { y: -4 }}
    >
      {comingSoon && (
        <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--fg-muted)]">
          Soon
        </span>
      )}
      <h3 className="font-[800] text-lg mb-1">{title}</h3>
      <p className="text-[var(--text-caption)] text-[var(--fg-muted)] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );

  if (comingSoon) return content;
  return <Link href={href}>{content}</Link>;
}
