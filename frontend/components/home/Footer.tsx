export default function Footer() {
  return (
    <footer style={{ borderTop: "1.5px solid rgba(45,45,45,0.08)", padding: "28px 32px" }}>
      <div style={{
        maxWidth:       1200,
        margin:         "0 auto",
        display:        "flex",
        flexWrap:       "wrap",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            12,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width:          34, height: 34,
            background:     "#2d2d2d",
            borderRadius:   "50%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13" stroke="#fdf6ec" strokeWidth="2" strokeLinecap="round"/>
              <rect x="3" y="13" width="18" height="5" rx="2.5" fill="#fdf6ec"/>
              <circle cx="7.5"  cy="18" r="1.5" fill="#2d2d2d"/>
              <circle cx="16.5" cy="18" r="1.5" fill="#2d2d2d"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: 16, color: "#2d2d2d" }}>
            RideMate
          </span>
        </div>

        {/* Copyright */}
        <p className="font-body" style={{ color: "#aaa", fontSize: 13 }}>
          © 2026 RideMate — made with 🫶 for students, by students.
        </p>
      </div>
    </footer>
  );
}