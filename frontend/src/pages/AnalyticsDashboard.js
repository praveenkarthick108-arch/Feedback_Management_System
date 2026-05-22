import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { analyticsApi } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  AreaChart, Area, Line, ResponsiveContainer,
} from "recharts";

const RATING_COLORS = ["#EF4444", "#F97316", "#F59E0B", "#22C55E", "#3B82F6"];

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "24px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #E5E7EB",
      borderTop: `4px solid ${color || "#4F46E5"}`, flex: 1, minWidth: 180,
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: color || "#1F2937" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, action }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "28px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #E5E7EB",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#374151" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "4px 0 0", fontSize: 12, color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value % 1 !== 0 ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

function RatingBar({ rating, count, percentage, label }) {
  const color = RATING_COLORS[rating - 1];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#374151" }}>⭐ {rating} — {label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{count} ({percentage}%)</span>
      </div>
      <div style={{ height: 8, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percentage}%`, background: color, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function formatMonthYear(my) {
  if (!my) return my;
  const [y, m] = my.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

function truncate(str, max) {
  return str && str.length > max ? str.slice(0, max) + "…" : str;
}

function formatLastRun(iso) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString();
}

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [ratingDist, setRatingDist] = useState([]);
  const [topPrograms, setTopPrograms] = useState([]);
  const [trends, setTrends] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("total_responses");
  const [downloading, setDownloading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, distRes, topRes, trendRes, breakRes] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getRatingDist(),
        analyticsApi.getTopPrograms(8),
        analyticsApi.getTrends(),
        analyticsApi.getBreakdown(sortBy),
      ]);
      setSummary(sumRes.data);
      setRatingDist(distRes.data);
      setTopPrograms(topRes.data);
      setTrends(trendRes.data.map(t => ({ ...t, month: formatMonthYear(t.month_year) })));
      setBreakdown(breakRes.data);
    } catch {
      setError("Failed to load analytics. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await analyticsApi.download();
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      a.href = url;
      a.download = `analytics_export_${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed.");
    } finally {
      setDownloading(false);
    }
  }

  const styles = {
    page: { minHeight: "100vh", background: "#F9FAFB", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    header: {
      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
      padding: "48px 32px 40px", color: "#fff",
    },
    container: { maxWidth: 1200, margin: "0 auto", padding: "32px 24px" },
    statsRow: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 },
    chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 },
    fullRow: { marginBottom: 28 },
    sortBtn: (active) => ({
      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
      background: active ? "#4F46E5" : "#F3F4F6", color: active ? "#fff" : "#6B7280",
    }),
    dlBtn: {
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
      background: downloading ? "#9CA3AF" : "#4F46E5", color: "#fff", border: "none",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600,
      color: "#6B7280", borderBottom: "2px solid #E5E7EB", background: "#F9FAFB", whiteSpace: "nowrap",
    },
    td: { padding: "12px 14px", fontSize: 13, color: "#374151", borderBottom: "1px solid #F3F4F6" },
  };

  const isEmpty = !loading && summary && summary.total_records === 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: "#fff" }}>Analytics Dashboard</h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginTop: 8, marginBottom: 0, color: "#fff" }}>
          Insights generated from ETL-processed feedback data
        </p>
      </div>

      <div style={styles.container}>
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9CA3AF" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 16 }}>Loading analytics…</p>
          </div>
        )}

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12,
            padding: "20px 24px", color: "#DC2626", marginBottom: 24,
          }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && isEmpty && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "64px 32px", textAlign: "center",
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: "1px solid #E5E7EB",
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📊</div>
            <h2 style={{ color: "#1F2937", marginBottom: 12 }}>No Analytics Data Yet</h2>
            <p style={{ color: "#6B7280", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
              Run your first ETL import to populate this dashboard with charts and insights.
            </p>
            <Link to="/etl" style={{
              display: "inline-block", background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              color: "#fff", textDecoration: "none", borderRadius: 10, padding: "12px 28px",
              fontSize: 15, fontWeight: 600,
            }}>
              Go to ETL Import
            </Link>
          </div>
        )}

        {!loading && !error && summary && summary.total_records > 0 && (
          <>
            {/* Summary Stats */}
            <div style={styles.statsRow}>
              <StatCard
                label="Total Records"
                value={summary.total_records.toLocaleString()}
                icon="📋"
                color="#4F46E5"
                sub="From analytics table"
              />
              <StatCard
                label="Average Rating"
                value={summary.avg_rating ? `${summary.avg_rating} / 5` : "—"}
                icon="⭐"
                color="#F59E0B"
                sub="Across all programs"
              />
              <StatCard
                label="Programs Tracked"
                value={summary.total_programs}
                icon="🎓"
                color="#10B981"
                sub="Unique programs"
              />
              <StatCard
                label="Last ETL Run"
                value={formatLastRun(summary.latest_run_at)}
                icon="🔄"
                color="#7C3AED"
                sub={summary.latest_run_id ? `Run #${summary.latest_run_id}` : "No runs yet"}
              />
            </div>

            {/* Charts Row */}
            <div style={styles.chartsRow}>
              {/* Rating Distribution */}
              <ChartCard title="Rating Distribution">
                {ratingDist.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={ratingDist} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="rating" tickFormatter={(v) => `⭐${v}`} tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Responses" radius={[6, 6, 0, 0]}>
                          {ratingDist.map((_, i) => (
                            <Cell key={i} fill={RATING_COLORS[i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 16 }}>
                      {ratingDist.map(item => (
                        <RatingBar key={item.rating} {...item} />
                      ))}
                    </div>
                  </>
                ) : <p style={{ color: "#9CA3AF", textAlign: "center" }}>No data</p>}
              </ChartCard>

              {/* Top Programs */}
              <ChartCard title="Top Programs by Avg Rating">
                {topPrograms.length > 0 ? (
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart
                      layout="vertical"
                      data={topPrograms.map(p => ({ ...p, name: truncate(p.program_name, 22) }))}
                      margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avg_rating" name="Avg Rating" fill="#7C3AED" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: "#9CA3AF", textAlign: "center" }}>No data</p>}
              </ChartCard>
            </div>

            {/* Trends */}
            <div style={styles.fullRow}>
              <ChartCard title="Monthly Feedback Trends">
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trends} margin={{ top: 8, right: 60, left: -16, bottom: 4 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="count"
                        name="Responses"
                        stroke="#4F46E5"
                        fill="url(#areaGrad)"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avg_rating"
                        name="Avg Rating"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#F59E0B" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: "#9CA3AF", textAlign: "center" }}>No trend data available</p>}
              </ChartCard>
            </div>

            {/* Program Breakdown Table */}
            <div style={styles.fullRow}>
              <ChartCard
                title="Program Breakdown"
                action={
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>Sort:</span>
                    {[
                      { key: "total_responses", label: "Responses" },
                      { key: "avg_rating", label: "Avg Rating" },
                      { key: "program_name", label: "Name" },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        style={styles.sortBtn(sortBy === opt.key)}
                        onClick={() => setSortBy(opt.key)}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button style={styles.dlBtn} onClick={handleDownload} disabled={downloading}>
                      {downloading ? "⏳" : "⬇️"} Download CSV
                    </button>
                  </div>
                }
              >
                {breakdown.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {["Program", "Responses", "Avg Rating", "5★", "4★", "3★", "2★", "1★"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {breakdown.map(row => (
                          <tr key={row.id}>
                            <td style={{ ...styles.td, fontWeight: 600, color: "#1F2937", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {row.program_name}
                            </td>
                            <td style={styles.td}>{row.total_responses}</td>
                            <td style={styles.td}>
                              <span style={{
                                padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                background: row.avg_rating >= 4.5 ? "#D1FAE5" : row.avg_rating >= 3.5 ? "#FEF3C7" : "#FEE2E2",
                                color: row.avg_rating >= 4.5 ? "#065F46" : row.avg_rating >= 3.5 ? "#92400E" : "#991B1B",
                              }}>
                                {row.avg_rating.toFixed(2)}
                              </span>
                            </td>
                            <td style={{ ...styles.td, color: "#3B82F6", fontWeight: 600 }}>{row.five_star_count}</td>
                            <td style={{ ...styles.td, color: "#22C55E", fontWeight: 600 }}>{row.four_star_count}</td>
                            <td style={{ ...styles.td, color: "#F59E0B", fontWeight: 600 }}>{row.three_star_count}</td>
                            <td style={{ ...styles.td, color: "#F97316", fontWeight: 600 }}>{row.two_star_count}</td>
                            <td style={{ ...styles.td, color: "#EF4444", fontWeight: 600 }}>{row.one_star_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p style={{ color: "#9CA3AF", textAlign: "center" }}>No program data available</p>}
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
