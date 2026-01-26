// src/WheelCanvas.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const MAX_SEGMENTS = 18;
const MAX_LABEL_CHARS = 16;

const SLICE_COLORS = [
  "#BFE7FF",
  "#D7F3FF",
  "#BFEFEA",
  "#D9F8F3",
  "#C9D9FF",
  "#E6ECFF",
  "#B8E1FF",
  "#D2FBFF",
];

export default function WheelCanvas({ restaurants }) {
  const wheelRef = useRef(null);
  const [result, setResult] = useState(null);

  const displayRestaurants = useMemo(
    () => restaurants.slice(0, MAX_SEGMENTS),
    [restaurants]
  );

  const shortenLabel = (name) => {
    if (!name) return "";
    const clean = String(name).replace(/\s+/g, " ").trim();
    if (clean.length <= MAX_LABEL_CHARS) return clean;
    return clean.slice(0, MAX_LABEL_CHARS - 1) + "…";
  };

  const drawCenterBubble = (wheel) => {
    const canvas = document.getElementById("restaurantCanvas");
    const ctx = canvas?.getContext("2d");
    if (!ctx || !wheel) return;

    // Use Winwheel's computed center (this fixes off-center dot)
    const cx = wheel.centerX;
    const cy = wheel.centerY;

    // Cover the middle cleanly
    ctx.save();

    // White center
    ctx.beginPath();
    ctx.arc(cx, cy, wheel.innerRadius + 2, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Soft ring
    ctx.beginPath();
    ctx.arc(cx, cy, wheel.innerRadius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(20, 30, 60, 0.18)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Small centered “bubble dot”
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(191, 231, 255, 0.95)";
    ctx.fill();

   

    ctx.restore();
  };

  useEffect(() => {
    if (typeof Winwheel === "undefined" || displayRestaurants.length === 0) return;

    const segCount = displayRestaurants.length;
    const textFontSize =
      segCount > 16 ? 11 : segCount > 12 ? 13 : segCount > 8 ? 15 : 18;

    const segments = displayRestaurants.map((r, i) => ({
      text: shortenLabel(r.name),
      restaurant: r,
      fillStyle: SLICE_COLORS[i % SLICE_COLORS.length],
    }));

    wheelRef.current = new Winwheel({
      canvasId: "restaurantCanvas",
      numSegments: segCount,
      outerRadius: 190,
      innerRadius: 48,

      segments,
      textFontSize,
      textOrientation: "horizontal",
      textAlignment: "outer",
      textMargin: 12,
      textFillStyle: "#0B1F2A",

      strokeStyle: "rgba(20, 30, 60, 0.35)",
      lineWidth: 2,

      pointerGuide: {
        display: true,
        strokeStyle: "#FF4D4D",
        lineWidth: 3,
      },

      animation: {
        type: "spinToStop",
        duration: 5,
        spins: 8,
        callbackFinished: (segment) => {
          setResult(segment.restaurant || { name: segment.text });
        },
      },
    });

    wheelRef.current.draw();
    drawCenterBubble(wheelRef.current);
  }, [displayRestaurants]);

  const startSpin = () => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    wheel.stopAnimation(false);
    wheel.rotationAngle = 0;
    wheel.draw();
    // Redraw center overlay after draw
    drawCenterBubble(wheel);
    wheel.startAnimation();
  };

  const closeModal = () => setResult(null);

  const buildMapsUrl = (rest) => {
    if (!rest) return "#";
    if (rest.lat && rest.lng && rest.id) {
      return `https://www.google.com/maps/search/?api=1&query=${rest.lat},${rest.lng}&query_place_id=${rest.id}`;
    }
    if (rest.name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        rest.name
      )}`;
    }
    return "#";
  };

  const hasRating =
    result && result.rating && result.rating !== "N/A" && result.rating !== 0;

  const ratingText = hasRating
    ? typeof result.rating === "number"
      ? result.rating.toFixed(1)
      : result.rating
    : null;

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <canvas id="restaurantCanvas" width="400" height="400" />

      <button style={{ marginTop: "14px" }} onClick={startSpin}>
        🎯 Spin the Wheel
      </button>

      {result && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
              maxWidth: "92%",
              width: "620px",
              textAlign: "center",
              border: "1px solid rgba(74,144,226,0.15)",
            }}
          >
            <h2 style={{ marginBottom: "1rem", color: "#2e7d32" }}>🎉 Result 🎉</h2>

            <p style={{ fontSize: "20px", color: "#137B3A", marginBottom: "1rem" }}>
              You should eat at: <strong>{result.name || "Unknown restaurant"}</strong>
            </p>

            {hasRating && (
              <p style={{ fontSize: "16px", margin: "0.25rem 0", color: "#0B1F2A" }}>
                ⭐ <strong>{ratingText}</strong> / 5
              </p>
            )}

            {result.address && (
              <p style={{ fontSize: "16px", margin: "0.25rem 0", color: "#0B1F2A" }}>
                📍 {result.address}
              </p>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              <a
                href={buildMapsUrl(result)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button style={{ marginRight: "10px" }}>Open in Google Maps</button>
              </a>

              <button
                onClick={closeModal}
                style={{ background: "#6B7280", borderColor: "rgba(0,0,0,0.10)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
