import React from "react";
import { Link } from "react-router-dom";
import { StarRatingDisplay } from "./StarRating";

const RATING_COLORS = {
  1: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
  2: { bg: "#FFF7ED", text: "#EA580C", border: "#FDBA74" },
  3: { bg: "#FEFCE8", text: "#CA8A04", border: "#FDE047" },
  4: { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
  5: { bg: "#EFF6FF", text: "#2563EB", border: "#93C5FD" },
};

export default function FeedbackCard({ feedback, onEdit, onDelete }) {
  const colors = RATING_COLORS[feedback.rating] || RATING_COLORS[3];
  const date = new Date(feedback.submitted_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${colors.border}` }}>
      <div style={styles.header}>
        <div style={styles.avatar}>{feedback.participant_name[0].toUpperCase()}</div>
        <div style={styles.headerText}>
          <Link to={`/feedback/${feedback.feedback_id}`} style={styles.name}>
            {feedback.participant_name}
          </Link>
          <span style={styles.program}>{feedback.program_name}</span>
        </div>
        <span
          style={{
            ...styles.ratingBadge,
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
          }}
        >
          {feedback.rating}/5
        </span>
      </div>

      <div style={styles.stars}>
        <StarRatingDisplay value={feedback.rating} size={16} />
      </div>

      {feedback.comments && (
        <p style={styles.comments}>
          {feedback.comments.length > 120
            ? feedback.comments.slice(0, 120) + "…"
            : feedback.comments}
        </p>
      )}

      <div style={styles.footer}>
        <span style={styles.date}>{date}</span>
        <div style={styles.actions}>
          {onEdit && (
            <button style={styles.btnEdit} onClick={() => onEdit(feedback)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button style={styles.btnDelete} onClick={() => onDelete(feedback.feedback_id)}>
              Delete
            </button>
          )}
          <Link to={`/feedback/${feedback.feedback_id}`} style={styles.btnView}>
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    transition: "box-shadow 0.2s, transform 0.2s",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: { display: "flex", alignItems: "flex-start", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  headerText: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1E293B",
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  program: {
    fontSize: 13,
    color: "#64748B",
    display: "block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  ratingBadge: {
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  stars: { marginTop: -4 },
  comments: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.6,
    background: "#F8FAFC",
    padding: "10px 14px",
    borderRadius: 8,
  },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 12, color: "#94A3B8" },
  actions: { display: "flex", gap: 8 },
  btnEdit: {
    padding: "5px 14px",
    borderRadius: 6,
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnDelete: {
    padding: "5px 14px",
    borderRadius: 6,
    border: "1px solid #FCA5A5",
    background: "#FEF2F2",
    color: "#DC2626",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  btnView: {
    padding: "5px 14px",
    borderRadius: 6,
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 500,
  },
};
