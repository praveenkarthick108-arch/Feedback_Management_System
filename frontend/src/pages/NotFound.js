import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "100px 24px" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>404</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
        Page not found
      </h2>
      <p style={{ color: "#64748B", marginBottom: 32 }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          padding: "12px 28px", borderRadius: 10,
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          color: "#fff", fontWeight: 600, fontSize: 15,
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
