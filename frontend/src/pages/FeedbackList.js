import React, { useEffect, useState, useCallback } from "react";
import { feedbackApi } from "../services/api";
import FeedbackCard from "../components/FeedbackCard";
import FeedbackModal from "../components/FeedbackModal";

const RATINGS = [
  { value: "", label: "All Ratings" },
  { value: 5, label: "⭐⭐⭐⭐⭐ Excellent" },
  { value: 4, label: "⭐⭐⭐⭐ Very Good" },
  { value: 3, label: "⭐⭐⭐ Good" },
  { value: 2, label: "⭐⭐ Fair" },
  { value: 1, label: "⭐ Poor" },
];

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbackApi.getAll({ limit: 200 });
      setFeedbacks(res.data.feedbacks);
      setTotal(res.data.total);
      setAvgRating(res.data.average_rating);
    } catch {
      setError("Failed to load feedback. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (ratingFilter) params.rating = ratingFilter;
      if (programFilter) params.program_name = programFilter;
      const res = await feedbackApi.search(params);
      setFeedbacks(res.data);
      setTotal(res.data.length);
    } catch {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  }, [keyword, ratingFilter, programFilter]);

  useEffect(() => {
    if (isSearchMode) doSearch();
    else loadAll();
  }, [isSearchMode, doSearch, loadAll]);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearchMode(true);
  };

  const clearSearch = () => {
    setKeyword(""); setRatingFilter(""); setProgramFilter("");
    setIsSearchMode(false);
  };

  const handleEdit = (feedback) => {
    setEditTarget(feedback);
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setModalLoading(true);
    try {
      await feedbackApi.update(editTarget.feedback_id, formData);
      showToast("Feedback updated successfully!");
      setModalOpen(false);
      setEditTarget(null);
      if (isSearchMode) doSearch(); else loadAll();
    } catch {
      showToast("Failed to update feedback.", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await feedbackApi.delete(id);
      showToast("Feedback deleted.");
      setDeleteConfirm(null);
      if (isSearchMode) doSearch(); else loadAll();
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  return (
    <div style={styles.page}>
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "#DC2626" : "#10B981" }}>
          {toast.msg}
        </div>
      )}

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>All Feedback</h1>
          <p style={styles.pageSub}>
            {total} {total === 1 ? "record" : "records"}
            {avgRating && !isSearchMode && ` · Average: ${avgRating.toFixed(1)} ⭐`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={styles.searchBar}>
        <input
          style={styles.searchInput}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by name, program, or keyword…"
        />
        <select
          style={styles.select}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          {RATINGS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <input
          style={{ ...styles.searchInput, maxWidth: 200 }}
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          placeholder="Filter by program…"
        />
        <button type="submit" style={styles.searchBtn}>Search</button>
        {isSearchMode && (
          <button type="button" style={styles.clearBtn} onClick={clearSearch}>
            Clear
          </button>
        )}
      </form>

      {isSearchMode && (
        <div style={styles.searchTag}>
          Showing results for {keyword && `"${keyword}"`}
          {ratingFilter && ` · ${ratingFilter}★`}
          {programFilter && ` · "${programFilter}"`}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : feedbacks.length === 0 ? (
        <EmptyState isSearch={isSearchMode} onClear={clearSearch} />
      ) : (
        <div style={styles.grid}>
          {feedbacks.map((f) => (
            <FeedbackCard
              key={f.feedback_id}
              feedback={f}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          ))}
        </div>
      )}

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSubmit={handleModalSubmit}
        initialData={editTarget}
        loading={modalLoading}
      />

      {deleteConfirm && (
        <div style={styles.overlay}>
          <div style={styles.confirmBox}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Feedback?</h3>
            <p style={{ color: "#64748B", marginBottom: 24, fontSize: 14 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button style={styles.btnCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={styles.btnConfirmDelete} onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ height: 180, background: "#E2E8F0", borderRadius: 12 }} />
      ))}
    </div>
  );
}

function EmptyState({ isSearch, onClear }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "#94A3B8" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{isSearch ? "🔍" : "📭"}</div>
      <p style={{ fontWeight: 500, marginBottom: 8 }}>
        {isSearch ? "No results found" : "No feedback submitted yet"}
      </p>
      {isSearch && (
        <button onClick={onClear} style={{ color: "#4F46E5", fontWeight: 500, background: "none", border: "none", fontSize: 14, cursor: "pointer" }}>
          Clear filters
        </button>
      )}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: 16, color: "#DC2626" }}>
      {message}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px" },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: 800, color: "#1E293B" },
  pageSub: { fontSize: 14, color: "#64748B", marginTop: 4 },
  searchBar: {
    display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20,
    background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  searchInput: {
    flex: 1, minWidth: 160, padding: "9px 14px",
    border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 14, color: "#1E293B",
  },
  select: {
    padding: "9px 14px", border: "1.5px solid #E2E8F0",
    borderRadius: 8, fontSize: 14, color: "#1E293B", background: "#fff",
  },
  searchBtn: {
    padding: "9px 22px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  clearBtn: {
    padding: "9px 16px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 14, cursor: "pointer",
  },
  searchTag: {
    fontSize: 13, color: "#4F46E5", background: "#EEF2FF",
    padding: "6px 14px", borderRadius: 20, display: "inline-block", marginBottom: 16,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(2px)",
  },
  confirmBox: {
    background: "#fff", borderRadius: 16, padding: 32, maxWidth: 360, width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  btnCancel: {
    padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 14, fontWeight: 500, cursor: "pointer",
  },
  btnConfirmDelete: {
    padding: "10px 20px", borderRadius: 8, border: "none",
    background: "#DC2626", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  toast: {
    position: "fixed", bottom: 24, right: 24, padding: "12px 24px",
    borderRadius: 10, color: "#fff", fontWeight: 500, fontSize: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 400,
  },
};
