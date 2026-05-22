import React, { useState, useEffect } from "react";
import { StarRatingInput } from "./StarRating";

export default function FeedbackModal({ isOpen, onClose, onSubmit, initialData, loading }) {
  const [form, setForm] = useState({ participant_name: "", program_name: "", rating: 0, comments: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        participant_name: initialData.participant_name || "",
        program_name: initialData.program_name || "",
        rating: initialData.rating || 0,
        comments: initialData.comments || "",
      });
    } else {
      setForm({ participant_name: "", program_name: "", rating: 0, comments: "" });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.participant_name.trim()) e.participant_name = "Name is required";
    if (!form.program_name.trim()) e.program_name = "Program/Event name is required";
    if (!form.rating) e.rating = "Please select a rating";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>{initialData ? "Edit Feedback" : "Submit Feedback"}</h2>
          <button style={styles.close} onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Participant Name" error={errors.participant_name} required>
            <input
              style={{ ...styles.input, ...(errors.participant_name ? styles.inputError : {}) }}
              value={form.participant_name}
              onChange={(e) => setForm({ ...form, participant_name: e.target.value })}
              placeholder="Enter your name"
              maxLength={100}
            />
          </Field>

          <Field label="Training / Event / Product" error={errors.program_name} required>
            <input
              style={{ ...styles.input, ...(errors.program_name ? styles.inputError : {}) }}
              value={form.program_name}
              onChange={(e) => setForm({ ...form, program_name: e.target.value })}
              placeholder="Enter program or event name"
              maxLength={200}
            />
          </Field>

          <Field label="Rating" error={errors.rating} required>
            <StarRatingInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          </Field>

          <Field label="Comments">
            <textarea
              style={{ ...styles.input, ...styles.textarea }}
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Share your experience (optional)"
              maxLength={2000}
              rows={4}
            />
            <span style={styles.charCount}>{form.comments.length}/2000</span>
          </Field>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnCancel} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? "Saving…" : initialData ? "Update" : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: 16,
    backdropFilter: "blur(2px)",
  },
  modal: {
    background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    maxHeight: "90vh", overflowY: "auto",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px 0",
  },
  title: { fontSize: 20, fontWeight: 700, color: "#1E293B" },
  close: {
    background: "none", border: "none", fontSize: 24, color: "#94A3B8",
    cursor: "pointer", lineHeight: 1, padding: 4, borderRadius: 6,
  },
  form: { display: "flex", flexDirection: "column", gap: 18, padding: 24 },
  input: {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #E2E8F0", borderRadius: 8,
    fontSize: 14, color: "#1E293B",
    transition: "border-color 0.2s",
    background: "#FAFAFA",
  },
  inputError: { borderColor: "#EF4444" },
  textarea: { resize: "vertical", minHeight: 100 },
  charCount: { fontSize: 11, color: "#9CA3AF", textAlign: "right" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 },
  btnCancel: {
    padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 14, fontWeight: 500, cursor: "pointer",
  },
  btnSubmit: {
    padding: "10px 24px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
};
