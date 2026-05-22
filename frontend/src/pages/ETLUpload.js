import React, { useState, useEffect, useRef, useCallback } from "react";
import { etlApi } from "../services/api";

const STATUS_COLORS = {
  success: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  failed: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  running: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" };
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
      backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB",
      borderTop: `4px solid ${color || "#4F46E5"}`,
      flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "#4F46E5" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function ETLUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const loadRuns = useCallback(async () => {
    try {
      const res = await etlApi.getRuns(20);
      setRuns(res.data);
    } catch {
      /* silent */
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  function handleFileSelect(f) {
    if (!f) return;
    const lower = f.name.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      setError("Only .csv and .xlsx files are supported.");
      return;
    }
    setError(null);
    setResult(null);
    setFile(f);
  }

  function handleInputChange(e) { handleFileSelect(e.target.files[0]); }
  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }
  function handleDragOver(e) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave() { setDragOver(false); }

  async function handleRunETL() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await etlApi.upload(formData);
      setResult(res.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadRuns();
    } catch (err) {
      const msg = err.response?.data?.detail || "Upload failed. Please try again.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  const styles = {
    page: { minHeight: "100vh", background: "#F9FAFB", fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    header: {
      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
      padding: "48px 32px 40px", color: "#fff",
    },
    headerTitle: { fontSize: 32, fontWeight: 700, margin: 0 },
    headerSub: { fontSize: 16, opacity: 0.85, marginTop: 8, margin: 0 },
    container: { maxWidth: 1000, margin: "0 auto", padding: "32px 24px" },
    card: {
      background: "#fff", borderRadius: 16, padding: "32px",
      boxShadow: "0 1px 6px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", marginBottom: 28,
    },
    sectionTitle: { fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20, marginTop: 0 },
    dropZone: {
      border: `2px dashed ${dragOver ? "#4F46E5" : "#D1D5DB"}`,
      borderRadius: 12, padding: "40px 24px", textAlign: "center", cursor: "pointer",
      background: dragOver ? "#EEF2FF" : "#FAFAFA",
      transition: "all 0.2s", marginBottom: 20,
    },
    dropIcon: { fontSize: 48, marginBottom: 12 },
    dropText: { color: "#374151", fontSize: 16, fontWeight: 500, margin: 0 },
    dropSub: { color: "#9CA3AF", fontSize: 13, marginTop: 6, margin: 0 },
    fileTag: {
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "#EEF2FF", border: "1px solid #C7D2FE",
      borderRadius: 8, padding: "8px 14px", marginBottom: 16,
      color: "#4338CA", fontSize: 14, fontWeight: 500,
    },
    runBtn: {
      background: uploading ? "#9CA3AF" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
      color: "#fff", border: "none", borderRadius: 10, padding: "12px 32px",
      fontSize: 15, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", gap: 10,
    },
    spinner: {
      width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)",
      borderTop: "2px solid #fff", borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    errorBox: {
      background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
      padding: "14px 18px", color: "#DC2626", fontSize: 14, marginBottom: 16,
      display: "flex", alignItems: "flex-start", gap: 10,
    },
    successBanner: {
      background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12,
      padding: "20px 24px", marginBottom: 24,
    },
    failureBanner: {
      background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12,
      padding: "20px 24px", marginBottom: 24,
    },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600,
      color: "#6B7280", borderBottom: "2px solid #E5E7EB", background: "#F9FAFB",
    },
    td: { padding: "12px 14px", fontSize: 13, color: "#374151", borderBottom: "1px solid #F3F4F6" },
  };

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>ETL Data Import</h1>
        <p style={styles.headerSub}>Upload a CSV or Excel file to import, clean, and analyze feedback data</p>
      </div>

      <div style={styles.container}>
        {/* Upload Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Upload Feedback Dataset</h2>

          <div
            style={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div style={styles.dropIcon}>📂</div>
            <p style={styles.dropText}>
              {file ? file.name : "Drop your CSV or XLSX file here, or click to browse"}
            </p>
            <p style={styles.dropSub}>Supports .csv and .xlsx · Max 10 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleInputChange}
            />
          </div>

          {file && (
            <div style={styles.fileTag}>
              <span>📄</span>
              <span>{file.name}</span>
              <span style={{ color: "#9CA3AF", fontSize: 12 }}>
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 16, padding: 0 }}
              >×</button>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            style={styles.runBtn}
            disabled={!file || uploading}
            onClick={handleRunETL}
          >
            {uploading && <div style={styles.spinner} />}
            {uploading ? "Processing..." : "Run ETL Pipeline"}
          </button>
        </div>

        {/* Result Panel */}
        {result && (
          <div style={result.status === "success" ? styles.successBanner : styles.failureBanner}>
            {result.status === "success" ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#065F46", marginBottom: 16 }}>
                  ✅ ETL Completed Successfully — {result.loaded_rows} records loaded
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <StatCard label="Total Rows" value={result.total_rows ?? "—"} color="#4F46E5" />
                  <StatCard label="Valid & Loaded" value={result.loaded_rows ?? "—"} color="#10B981" />
                  <StatCard label="Duplicates Dropped" value={result.duplicate_rows ?? 0} color="#F59E0B" />
                  <StatCard label="Invalid Dropped" value={result.invalid_rows ?? 0} color="#EF4444" />
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#991B1B", marginBottom: 8 }}>
                  ❌ ETL Failed
                </div>
                <div style={{ color: "#B91C1C", fontSize: 14 }}>{result.error_message || "An unexpected error occurred."}</div>
              </div>
            )}
          </div>
        )}

        {/* Run History */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>ETL Run History</h2>
          {runsLoading ? (
            <p style={{ color: "#9CA3AF", textAlign: "center", padding: "40px 0" }}>Loading run history…</p>
          ) : runs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9CA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
              <p style={{ margin: 0, fontSize: 15 }}>No ETL runs yet. Upload a file above to get started.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Run #", "File", "Status", "Triggered At", "Total", "Loaded", "Dupes", "Invalid"].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {runs.map(run => (
                    <tr key={run.run_id} style={{ background: "#fff" }}>
                      <td style={{ ...styles.td, fontWeight: 600, color: "#4F46E5" }}>#{run.run_id}</td>
                      <td style={{ ...styles.td, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {run.filename}
                      </td>
                      <td style={styles.td}><StatusBadge status={run.status} /></td>
                      <td style={{ ...styles.td, whiteSpace: "nowrap" }}>{formatDate(run.triggered_at)}</td>
                      <td style={styles.td}>{run.total_rows ?? "—"}</td>
                      <td style={{ ...styles.td, color: "#10B981", fontWeight: 600 }}>{run.loaded_rows ?? "—"}</td>
                      <td style={{ ...styles.td, color: "#F59E0B", fontWeight: 600 }}>{run.duplicate_rows ?? "—"}</td>
                      <td style={{ ...styles.td, color: "#EF4444", fontWeight: 600 }}>{run.invalid_rows ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ETL Info Card */}
        <div style={{ ...styles.card, background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)" }}>
          <h2 style={{ ...styles.sectionTitle, color: "#4F46E5" }}>How the ETL Pipeline Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { step: "1", icon: "📥", title: "Extract", desc: "Reads CSV or Excel files. Validates required columns (participant_name, program_name, rating)." },
              { step: "2", icon: "🔧", title: "Transform", desc: "Removes duplicates, fixes invalid ratings, strips whitespace, normalizes case, and parses dates." },
              { step: "3", icon: "💾", title: "Load", desc: "Inserts clean records into the analytics table and computes per-program aggregates." },
            ].map(s => (
              <div key={s.step} style={{ background: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1F2937", marginBottom: 6 }}>{s.step}. {s.title}</div>
                <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
