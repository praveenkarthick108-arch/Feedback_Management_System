import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { feedbackApi } from "../services/api";
import { StarRatingInput } from "../components/StarRating";

export default function SubmitFeedback() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ participant_name: "", program_name: "", rating: 0, comments: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.participant_name.trim()) e.participant_name = "Name is required";
    if (!form.program_name.trim()) e.program_name = "Program / event name is required";
    if (!form.rating) e.rating = "Please select a rating";
    return e;
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await feedbackApi.create(form);
      setSuccess(true);
      setTimeout(() => navigate("/feedback"), 2000);
    } catch {
      setErrors({ submit: "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>&#127881;</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>
            Thank you for your feedback!
          </h2>
          <p style={{ color: "#64748B" }}>Redirecting you to the feedback list…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <div style={styles.formHeader}>
          <h1 style={styles.title}>Submit Feedback</h1>
          <p style={styles.sub}>Share your experience to help us improve</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {errors.submit && (
            <div style={styles.errorBanner}>{errors.submit}</div>
          )}

          <FormField label="Participant Name" error={errors.participant_name} required>
            <input
              style={{ ...styles.input, ...(errors.participant_name ? styles.inputError : {}) }}
              value={form.participant_name}
              onChange={handleChange("participant_name")}
              placeholder="Your full name"
              maxLength={100}
            />
          </FormField>

          <FormField label="Training / Event / Product" error={errors.program_name} required>
            <input
              style={{ ...styles.input, ...(errors.program_name ? styles.inputError : {}) }}
              value={form.program_name}
              onChange={handleChange("program_name")}
              placeholder="e.g. React Bootcamp, Product Onboarding…"
              maxLength={200}
            />
          </FormField>

          <FormField label="Rating" error={errors.rating} required>
            <div style={styles.ratingWrapper}>
              <StarRatingInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
            </div>
          </FormField>

          <FormField label="Comments">
            <textarea
              style={{ ...styles.input, ...styles.textarea }}
              value={form.comments}
              onChange={handleChange("comments")}
              placeholder="Describe your experience in detail…"
              maxLength={2000}
              rows={5}
            />
            <div style={{ textAlign: "right", fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
              {form.comments.length}/2000
            </div>
          </FormField>

          <div style={styles.btnRow}>
            <button
              type="button"
              style={styles.btnCancel}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? (
                <span>Submitting…</span>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>

      <div style={styles.tips}>
        <h3 style={styles.tipsTitle}>Tips for great feedback</h3>
        <ul style={styles.tipsList}>
          {[
            "Be specific about what worked well or what didn't",
            "Focus on your personal experience",
            "Constructive criticism helps improve future experiences",
            "Mention specific aspects you found most valuable",
          ].map((tip, i) => (
            <li key={i} style={styles.tip}>
              <span style={styles.tipDot} />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FormField({ label, error, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 1100, margin: "0 auto", padding: "32px 24px",
    display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start",
  },
  formWrapper: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
  formHeader: {
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    padding: "28px 32px", color: "#fff",
  },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  sub: { fontSize: 14, opacity: 0.85 },
  form: { padding: 32, display: "flex", flexDirection: "column", gap: 22 },
  errorBanner: {
    background: "#FEF2F2", border: "1px solid #FCA5A5",
    borderRadius: 8, padding: "12px 16px", color: "#DC2626", fontSize: 14,
  },
  input: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #E2E8F0", borderRadius: 8,
    fontSize: 14, color: "#1E293B", background: "#FAFAFA",
    transition: "border-color 0.2s",
  },
  inputError: { borderColor: "#EF4444", background: "#FFF5F5" },
  textarea: { resize: "vertical", minHeight: 120 },
  ratingWrapper: { padding: "8px 0" },
  btnRow: { display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 4 },
  btnCancel: {
    padding: "11px 22px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 14, fontWeight: 500, cursor: "pointer",
  },
  btnSubmit: {
    padding: "11px 28px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
  successBox: {
    gridColumn: "1 / -1", textAlign: "center", padding: "80px 24px",
    background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  tips: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  tipsTitle: { fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 16 },
  tipsList: { display: "flex", flexDirection: "column", gap: 12, listStyle: "none" },
  tip: { display: "flex", gap: 10, fontSize: 13, color: "#475569", lineHeight: 1.5 },
  tipDot: { width: 6, height: 6, borderRadius: "50%", background: "#4F46E5", marginTop: 5, flexShrink: 0 },
};
