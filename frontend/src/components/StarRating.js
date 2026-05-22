import React, { useState } from "react";

const LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

export function StarRatingInput({ value, onChange, disabled = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(0)}
            style={{
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: disabled ? "default" : "pointer",
              color: star <= (hovered || value) ? "#F59E0B" : "#D1D5DB",
              transform: star <= (hovered || value) ? "scale(1.1)" : "scale(1)",
              transition: "all 0.15s",
              padding: 2,
              lineHeight: 1,
            }}
            aria-label={`Rate ${star} star`}
          >
            &#9733;
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>
          {LABELS[hovered || value]}
        </span>
      )}
    </div>
  );
}

export function StarRatingDisplay({ value, size = 18 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: size,
            color: star <= value ? "#F59E0B" : "#D1D5DB",
            lineHeight: 1,
          }}
        >
          &#9733;
        </span>
      ))}
      <span style={{ fontSize: size - 4, color: "#6B7280", marginLeft: 4, fontWeight: 500 }}>
        {LABELS[value]}
      </span>
    </span>
  );
}
