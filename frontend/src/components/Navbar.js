import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/submit", label: "Submit Feedback" },
  { to: "/feedback", label: "All Feedback" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>&#128172;</span>
          <span style={styles.brandText}>FeedbackMS</span>
        </Link>

        <div style={styles.links}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.link,
                ...(pathname === to ? styles.linkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span style={styles.bar} />
          <span style={styles.bar} />
          <span style={styles.bar} />
        </button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.mobileLink,
                ...(pathname === to ? styles.mobileLinkActive : {}),
              }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    boxShadow: "0 2px 12px rgba(79,70,229,0.3)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#fff",
    fontWeight: 700,
    fontSize: 20,
  },
  brandIcon: { fontSize: 24 },
  brandText: { letterSpacing: "-0.3px" },
  links: {
    display: "flex",
    gap: 4,
    "@media(max-width:768px)": { display: "none" },
  },
  link: {
    color: "rgba(255,255,255,0.8)",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s",
  },
  linkActive: {
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
  },
  hamburger: {
    display: "none",
    flexDirection: "column",
    gap: 5,
    background: "none",
    border: "none",
    padding: 8,
    cursor: "pointer",
  },
  bar: {
    display: "block",
    width: 22,
    height: 2,
    background: "#fff",
    borderRadius: 2,
  },
  mobileMenu: {
    background: "rgba(79,70,229,0.97)",
    padding: "12px 24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  mobileLink: {
    color: "rgba(255,255,255,0.85)",
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
  },
  mobileLinkActive: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
  },
};
