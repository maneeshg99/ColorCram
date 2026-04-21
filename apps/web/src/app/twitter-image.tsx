import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ColorCram — the color memory game";

export default async function Image() {
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
        }}
      >
        <div
          style={{
            fontSize: 180,
            fontWeight: 900,
            letterSpacing: -4,
            display: "flex",
            gap: 4,
          }}
        >
          <span
            style={{
              background:
                "linear-gradient(90deg, #ff3b3b 0%, #ffb020 25%, #00d48a 50%, #00b3ff 75%, #b066ff 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            color
          </span>
          <span style={{ color: "#adadad" }}>cram</span>
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#adadad",
            marginTop: 32,
            textAlign: "center",
          }}
        >
          Memorize a color. Recreate it from memory.
        </div>
      </div>
    ),
    size,
  );
}
