import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
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
          backgroundColor: "#0f172a",
          color: "white",
          padding: "40px",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#22c55e",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 36,
            marginTop: "24px",
            color: "#cbd5e1",
            textAlign: "center",
          }}
        >
          {SITE_DESCRIPTION}
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: "56px",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
          }}
        >
          Shop smarter. Checkout faster.
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}