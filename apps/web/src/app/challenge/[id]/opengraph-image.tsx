import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ColorCram challenge";

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data } = await supabase
    .from("shared_results")
    .select("avg_score, mode")
    .eq("id", params.id)
    .single();

  const score = data?.avg_score ?? "—";
  const mode = data?.mode
    ? data.mode.charAt(0).toUpperCase() + data.mode.slice(1)
    : "Classic";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#131313",
          fontFamily: "system-ui, sans-serif",
          padding: 60,
        }}
      >
        <div
          style={{
            fontSize: 42,
            color: "#adadad",
            fontWeight: 600,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          {`ColorCram ${mode}`}
        </div>
        <div
          style={{
            fontSize: 320,
            fontWeight: 900,
            letterSpacing: -12,
            color: "#fff",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          {`${score}%`}
        </div>
        <div style={{ fontSize: 36, color: "#adadad", textAlign: "center" }}>
          Can you beat this score?
        </div>
      </div>
    ),
    size,
  );
}
