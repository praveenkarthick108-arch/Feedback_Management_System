import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { feedbackApi } from "../services/api";
import { StarRatingDisplay } from "../components/StarRating";
import FeedbackModal from "../components/FeedbackModal";

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    feedbackApi.getById(id)
      .then((res) => setFeedback(res.data))
      .catch(() => setError("Feedback not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (formData) => {
    setModalLoading(true);
    try {
      const res = await feedbackApi.update(id, formData);
      setFeedback(res.data);
      setModalOpen(false);
      showToast("Feedback updated!");
    } catch {
      showToast("Update failed.", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await feedbackApi.delete(id);
      navigate("/feedback", { replace: true });
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorPage message={error} />;

  const submittedDate = new Date(feedback.submitted_at).toLocaleString("en-IN", {
    dateStyle: "long", timeStyle: "short",
  });

  const RATING_BG = { 1: "#FEF2F2", 2: "#FFF7ED", 3: "#FEFCE8", 4: "#F0FDF4", 5: "#EFF6FF" };
  const RATING_COLOR = { 1: "#DC2626", 2: "#EA580C", 3: "#CA8A04", 4: "#16A34A", 5: "#2563EB" };

  return (
    <div style={styles.page}>
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "#DC2626" : "#10B981" }}>
          {toast.msg}
        </div>
      )}

      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadLink}>Dashboard</Link>
        <span style={styles.breadSep}>/</span>
        <Link to="/feedback" style={styles.breadLink}>All Feedback</Link>
        <span style={styles.breadSep}>/</span>
        <span style={styles.breadCurrent}>#{feedback.feedback_id}</span>
      </div>

      <div style={styles.card}>
        <div style={{ ...styles.cardHeader, background: RATING_BG[feedback.rating] }}>
          <div style={styles.avatar}>{feedback.participant_name[0].toUpperCase()}</div>
          <div style={styles.headerInfo}>
            <h1 style={styles.participantName}>{feedback.participant_name}</h1>
            <p style={styles.programName}>{feedback.program_name}</p>
          </div>
          <div
            style={{
              ...styles.ratingBig,
              color: RATING_COLOR[feedback.rating],
            }}
          >
            {feedback.rating}/5
          </div>
        </div>

        <div style={styles.body}>
          <div style={styles.infoGrid}>
            <InfoBlock label="Rating">
              <StarRatingDisplay value={feedback.rating} size={20} />
            </InfoBlock>
            <InfoBlock label="Submitted At">
              <span style={styles.infoValue}>{submittedDate}</span>
            </InfoBlock>
            <InfoBlock label="Feedback ID">
              <span style={styles.infoValue}>#{feedback.feedback_id}</span>
            </InfoBlock>
            <InfoBlock label="Program / Event">
              <span style={styles.infoValue}>{feedback.program_name}</span>
            </InfoBlock>
          </div>

          {feedback.comments ? (
            <div style={styles.commentsSection}>
              <h3 style={styles.commentsTitle}>Comments</h3>
              <p style={styles.commentsText}>{feedback.comments}</p>
            </div>
          ) : (
            <div style={styles.noComments}>No comments provided.</div>
          )}

          <div style={styles.actions}>
            <button style={styles.btnEdit} onClick={() => setModalOpen(true)}>
              ✏️ Edit Feedback
            </button>
            <button style={styles.btnDelete} onClick={() => setDeleteConfirm(true)}>
              🗑️ Delete
            </button>
            <Link to="/feedback" style={styles.btnBack}>← Back to List</Link>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={feedback}
        loading={modalLoading}
      />

      {deleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.confirmBox}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete this feedback?</h3>
            <p style={{ color: "#64748B", marginBottom: 24, fontSize: 14 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button style={styles.btnCancelConf} onClick={() => setDeleteConfirm(false)}>Cancel</button>
              <button style={styles.btnConfirmDel} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <div style={{ fontSize: 32 }}>⏳</div>
    </div>
  );
}

function ErrorPage({ message }) {
  return (
    <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <p style={{ color: "#DC2626", fontWeight: 500 }}>{message}</p>
      <Link to="/feedback" style={{ color: "#4F46E5", marginTop: 16, display: "inline-block" }}>← Go back</Link>
    </div>
  );
}

const styles = {
  page: { maxWidth: 800, margin: "0 auto", padding: "32px 24px" },
  breadcrumb: { display: "flex", gap: 8, alignItems: "center", marginBottom: 20, fontSize: 13 },
  breadLink: { color: "#4F46E5" },
  breadSep: { color: "#CBD5E1" },
  breadCurrent: { color: "#64748B" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
  cardHeader: {
    padding: "32px 32px", display: "flex", gap: 20, alignItems: "center",
  },
  avatar: {
    width: 64, height: 64, borderRadius: "50%",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 28, fontWeight: 700, flexShrink: 0,
  },
  headerInfo: { flex: 1 },
  participantName: { fontSize: 22, fontWeight: 800, color: "#1E293B", marginBottom: 4 },
  programName: { fontSize: 14, color: "#64748B" },
  ratingBig: { fontSize: 40, fontWeight: 900 },
  body: { padding: "32px" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24, marginBottom: 28 },
  infoValue: { fontSize: 15, color: "#1E293B", fontWeight: 500 },
  commentsSection: {
    background: "#F8FAFC", borderRadius: 10, padding: "20px 24px", marginBottom: 28,
    borderLeft: "4px solid #4F46E5",
  },
  commentsTitle: { fontSize: 14, fontWeight: 700, color: "#4F46E5", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" },
  commentsText: { fontSize: 15, color: "#374151", lineHeight: 1.7 },
  noComments: { fontSize: 14, color: "#94A3B8", fontStyle: "italic", marginBottom: 28 },
  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  btnEdit: {
    padding: "11px 22px", borderRadius: 8, border: "1.5px solid #C7D2FE",
    background: "#EEF2FF", color: "#4F46E5", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  btnDelete: {
    padding: "11px 22px", borderRadius: 8, border: "1.5px solid #FCA5A5",
    background: "#FEF2F2", color: "#DC2626", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  btnBack: {
    padding: "11px 22px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 14, fontWeight: 500,
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(2px)",
  },
  confirmBox: {
    background: "#fff", borderRadius: 16, padding: 32, maxWidth: 360, width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  btnCancelConf: {
    padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 14, fontWeight: 500, cursor: "pointer",
  },
  btnConfirmDel: {
    padding: "10px 20px", borderRadius: 8, border: "none",
    background: "#DC2626", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  toast: {
    position: "fixed", bottom: 24, right: 24, padding: "12px 24px",
    borderRadius: 10, color: "#fff", fontWeight: 500, fontSize: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 400,
  },
};
