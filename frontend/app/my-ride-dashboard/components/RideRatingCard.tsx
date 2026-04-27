"use client";

import { useEffect, useState } from "react";

type RideRatingCardProps = {
  rideId: number;
  driverName?: string | null;
};

const STORAGE_KEY = "ridemate_ride_ratings";

type StoredRatings = Record<string, { rating: number; feedback: string; ratedAt: string }>;

function readStoredRatings(): StoredRatings {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredRatings) : {};
  } catch {
    return {};
  }
}

function writeStoredRatings(value: StoredRatings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export default function RideRatingCard({ rideId, driverName }: RideRatingCardProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = readStoredRatings();
    const existing = stored[String(rideId)];
    if (existing) {
      setRating(existing.rating);
      setFeedback(existing.feedback);
      setSubmitted(true);
    }
  }, [rideId]);

  const handleSubmit = () => {
    if (rating < 1) return;
    const stored = readStoredRatings();
    stored[String(rideId)] = {
      rating,
      feedback: feedback.trim(),
      ratedAt: new Date().toISOString(),
    };
    writeStoredRatings(stored);
    setSubmitted(true);
  };

  const handleEdit = () => setSubmitted(false);

  const display = hoverRating || rating;

  const ratingLabels: Record<number, string> = {
    1: "Not great",
    2: "Could be better",
    3: "It was okay",
    4: "Pretty good",
    5: "Loved it!",
  };

  return (
    <div className="mrd-section" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <span className="mrd-label">Rate your ride</span>
        <h3
          className="font-display"
          style={{ fontSize: 22, fontWeight: 700, color: "#1e1e1e", marginTop: 4 }}
        >
          {submitted ? "Thanks for the feedback! 🌸" : "How was your ride?"}
        </h3>
        <p
          className="font-body"
          style={{ fontSize: 13, color: "#a09890", marginTop: 6, lineHeight: 1.6 }}
        >
          {submitted
            ? `You rated this ride ${rating} ${rating === 1 ? "star" : "stars"}${
                driverName ? ` for ${driverName}` : ""
              }.`
            : `Tell us how ${driverName || "your driver"} did.`}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Ride rating"
        style={{ display: "flex", gap: 6, alignItems: "center" }}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = value <= display;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
              disabled={submitted}
              onClick={() => setRating(value)}
              onMouseEnter={() => !submitted && setHoverRating(value)}
              onMouseLeave={() => !submitted && setHoverRating(0)}
              onFocus={() => !submitted && setHoverRating(value)}
              onBlur={() => !submitted && setHoverRating(0)}
              style={{
                background: "transparent",
                border: "none",
                padding: 4,
                cursor: submitted ? "default" : "pointer",
                fontSize: 36,
                lineHeight: 1,
                color: filled ? "#ffb547" : "#e2dcd2",
                transition: "transform 0.15s, color 0.15s",
                transform: !submitted && hoverRating === value ? "scale(1.15)" : "scale(1)",
              }}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
        {display > 0 && (
          <span
            className="font-body"
            style={{ fontSize: 13, color: "#8a8380", marginLeft: 8 }}
          >
            {ratingLabels[display]}
          </span>
        )}
      </div>

      {!submitted && (
        <>
          <div>
            <label className="mrd-label" htmlFor={`ride-feedback-${rideId}`}>
              Anything to add? (optional)
            </label>
            <textarea
              id={`ride-feedback-${rideId}`}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              maxLength={280}
              placeholder="Share what made the ride great or what could improve…"
              style={{
                width: "100%",
                minHeight: 84,
                resize: "vertical",
                padding: "10px 12px",
                borderRadius: 14,
                border: "1.5px solid rgba(45,45,45,0.12)",
                background: "rgba(255,255,255,0.7)",
                fontFamily: "var(--font-dm), sans-serif",
                fontSize: 14,
                color: "#1e1e1e",
                outline: "none",
                marginTop: 6,
              }}
            />
          </div>

          <button
            type="button"
            className="mrd-btn mrd-btn-accent"
            disabled={rating < 1}
            onClick={handleSubmit}
            style={{ alignSelf: "flex-start", width: "auto" }}
          >
            Submit rating
          </button>
        </>
      )}

      {submitted && feedback && (
        <div
          className="font-body"
          style={{
            fontSize: 13,
            color: "#3a3530",
            background: "rgba(255,255,255,0.6)",
            border: "1.5px solid rgba(45,45,45,0.08)",
            borderRadius: 14,
            padding: "10px 14px",
            lineHeight: 1.55,
          }}
        >
          “{feedback}”
        </div>
      )}

      {submitted && (
        <button
          type="button"
          onClick={handleEdit}
          style={{
            alignSelf: "flex-start",
            background: "transparent",
            border: "none",
            color: "#ff9b6a",
            fontFamily: "var(--font-dm), sans-serif",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Edit my rating
        </button>
      )}
    </div>
  );
}
