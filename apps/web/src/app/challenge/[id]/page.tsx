import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { ChallengeView } from "./ChallengeView";

async function getSharedResult(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase
    .from("shared_results")
    .select("avg_score, mode, difficulty")
    .eq("id", id)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getSharedResult(id);
  if (!result) {
    return { title: "Challenge" };
  }
  const modeLabel =
    result.mode.charAt(0).toUpperCase() + result.mode.slice(1);
  const title = `Beat ${result.avg_score}% on ColorCram ${modeLabel}`;
  return {
    title,
    description:
      "Can you beat this score? Memorize a color and recreate it from memory.",
    openGraph: {
      title,
      description:
        "Can you beat this score? Memorize a color and recreate it from memory.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description:
        "Can you beat this score? Memorize a color and recreate it from memory.",
    },
  };
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChallengeView id={id} />;
}
