import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { feedbackApi } from "../services/api";
import FeedbackCard from "../components/FeedbackCard";
import { StarRatingDisplay } from "../components/StarRating";

export default function Dashboard() {
  const [data, setData] = useState({ total: 0, feedbacks: [], average_rating: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    feedbackApi.getAll({ limit: 5 })
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: data.feedbacks.filter((f) => f.rating === r).length,
  }));

  return (
    <div style={styles.page}>
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Feedback Dashboard</h1>
        <p style={styles.heroSub}>
          Centralized view of all participant feedback and satisfaction metrics
        </p>
        <Link to="/submit" style={styles.heroBtn}>+ Submit Feedback</Link>
      </div>

      {loading ? (
        <LoadingGrid />
      ) : error ? (
        <ErrorBanner message={error} />
      ) : (
        <>
          <div style={styles.statsGrid}>
            <StatCard
              icon="&#128172;"
              label="Total Feedback"
              value={data.total}
              color="#4F46E5"
              bg="#EEF2FF"
            />
            <StatCard
              icon="&#11088;"
              label="Average Rating"
              value={data.average_rating ? data.average_rating.toFixed(1) : "—"}
              sub={data.average_rating ? <StarRatingDisplay value={Math.round(data.average_rating)} size={14} /> : null}
              color="#F59E0B"
              bg="#FFFBEB"
            />
            <StatCard
              icon="&#128200;"
              label="5-Star Reviews"
              value={data.feedbacks.filter((f) => f.rating === 5).length}
              color="#10B981"
              bg="#ECFDF5"
            />
            <StatCard
              icon="&#128203;"
              label="This Session"
              value={data.feedbacks.length}
              sub="Recent entries"
              color="#7C3AED"
              bg="#F5F3FF"
            />
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.recentSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Feedback</h2>
                <Link to="/feedback" style={styles.viewAll}>View all →</Link>
              </div>
              {data.feedbacks.length === 0 ? (
                <EmptyState />
              ) : (
                <div style={styles.cardList}>
                  {data.feedbacks.slice(0, 5).map((f) => (
                    <FeedbackCard key={f.feedback_id} feedback={f} />
                  ))}
                </div>
              )}
            </section>

            <aside style={styles.sidebar}>
              <div style={styles.sideCard}>
                <h3 style={styles.sideTitle}>Rating Distribution</h3>
                {data.total === 0 ? (
                  <p style={styles.noData}>No data yet</p>
                ) : (
                  ratingDist.map(({ rating, count }) => (
                    <RatingBar key={rating} rating={rating} count={count} total={data.total} />
                  ))
                )}
              </div>

              <div style={styles.sideCard}>
                <h3 style={styles.sideTitle}>Quick Actions</h3>
                <div style={styles.quickActions}>
                  <Link to="/submit" style={styles.qaBtn}>&#9998; Submit Feedback</Link>
                  <Link to="/feedback" style={styles.qaBtn}>&#128203; Browse All</Link>
                  <Link to="/feedback?search=true" style={styles.qaBtn}>&#128269; Search & Filter</Link>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ ...styles.statIcon, background: bg, color }}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
        {sub && <div style={styles.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

function RatingBar({ rating, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const labels = { 5: "Excellent", 4: "Very Good", 3: "Good", 2: "Fair", 1: "Poor" };
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#374151" }}>
          <span style={{ color: "#F59E0B" }}>&#9733;</span> {rating} — {labels[rating]}
        </span>
        <span style={{ fontSize: 12, color: "#6B7280" }}>{count} ({pct}%)</span>
      </div>
      <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#4F46E5", borderRadius: 3, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 100, background: "#E2E8F0", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "#94A3B8" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>&#128172;</div>
      <p style={{ fontWeight: 500, marginBottom: 8 }}>No feedback yet</p>
      <Link to="/submit" style={{ color: "#4F46E5", fontWeight: 500 }}>Be the first to submit →</Link>
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
  heroSection: {
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    borderRadius: 16, padding: "40px 40px", marginBottom: 32, color: "#fff",
  },
  heroTitle: { fontSize: 32, fontWeight: 800, marginBottom: 8 },
  heroSub: { fontSize: 16, opacity: 0.85, marginBottom: 24 },
  heroBtn: {
    display: "inline-block", padding: "12px 28px", borderRadius: 10,
    background: "#fff", color: "#4F46E5", fontWeight: 700, fontSize: 15,
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16, marginBottom: 32,
  },
  statCard: {
    background: "#fff", borderRadius: 12, padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", gap: 16, alignItems: "center",
  },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  statValue: { fontSize: 28, fontWeight: 800, color: "#1E293B", lineHeight: 1 },
  statLabel: { fontSize: 13, color: "#64748B", marginTop: 4 },
  statSub: { marginTop: 4 },
  contentGrid: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" },
  recentSection: {},
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: "#1E293B" },
  viewAll: { fontSize: 14, color: "#4F46E5", fontWeight: 500 },
  cardList: { display: "flex", flexDirection: "column", gap: 12 },
  sidebar: { display: "flex", flexDirection: "column", gap: 16 },
  sideCard: { background: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  sideTitle: { fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 16 },
  noData: { fontSize: 13, color: "#94A3B8" },
  quickActions: { display: "flex", flexDirection: "column", gap: 8 },
  qaBtn: {
    display: "block", padding: "10px 14px", borderRadius: 8,
    background: "#F8FAFC", color: "#374151", fontSize: 14, fontWeight: 500,
    border: "1px solid #E2E8F0",
  },
};
