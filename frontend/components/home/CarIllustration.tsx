export default function CarIllustration() {
  return (
    <div className="hidden lg:block relative" style={{ minHeight: 520 }}>

      {/* Floating car SVG */}
      <div className="car-float" style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%) rotate(-3deg)",
        width: 360
      }}>
        <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="90" width="320" height="65" rx="14" fill="#2d2d2d"/>
          <path d="M80 90 C95 55, 130 42, 165 40 L210 40 C240 40, 270 52, 285 90Z" fill="#3d3d3d"/>
          <path d="M100 88 C112 62, 135 50, 162 48 L190 48 C205 48 218 55, 228 68 L235 88Z" fill="#a8d8f0" opacity="0.85"/>
          <path d="M108 85 C118 65, 136 55, 158 53" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
          <line x1="195" y1="92" x2="195" y2="152" stroke="#555" strokeWidth="1.5"/>
          <rect x="155" y="118" width="22" height="7" rx="3.5" fill="#666"/>
          <rect x="210" y="118" width="22" height="7" rx="3.5" fill="#666"/>
          <rect x="298" y="112" width="22" height="8" rx="4" fill="#555"/>
          <rect x="300" y="122" width="20" height="5" rx="2.5" fill="#555"/>
          <ellipse cx="326" cy="108" rx="10" ry="8" fill="#ffe9a0"/>
          <ellipse cx="326" cy="108" rx="6" ry="5" fill="#ffcc44"/>
          <rect x="22" y="105" width="16" height="12" rx="4" fill="#ff6b6b" opacity="0.9"/>
          {/* Wheels */}
          <circle cx="90" cy="155" r="26" fill="#1a1a1a"/>
          <circle cx="90" cy="155" r="16" fill="#333"/>
          <circle cx="90" cy="155" r="8" fill="#c0c0c0"/>
          <circle cx="270" cy="155" r="26" fill="#1a1a1a"/>
          <circle cx="270" cy="155" r="16" fill="#333"/>
          <circle cx="270" cy="155" r="8" fill="#c0c0c0"/>
          {/* Spokes */}
          <line x1="90" y1="139" x2="90" y2="171" stroke="#aaa" strokeWidth="2.5" className="wheel" style={{ transformOrigin: "90px 155px" }}/>
          <line x1="74" y1="155" x2="106" y2="155" stroke="#aaa" strokeWidth="2.5"/>
          <line x1="270" y1="139" x2="270" y2="171" stroke="#aaa" strokeWidth="2.5"/>
          <line x1="254" y1="155" x2="286" y2="155" stroke="#aaa" strokeWidth="2.5"/>
          <text x="165" y="130" fontSize="18" textAnchor="middle">🩷</text>
          <ellipse cx="180" cy="181" rx="140" ry="8" fill="#2d2d2d" opacity="0.08"/>
        </svg>
      </div>

      {/* Animated road strip */}
      <div style={{
        position: "absolute", bottom: 20, left: "5%", right: "5%",
        height: 14, borderRadius: 7,
        background: "rgba(210,185,160,0.4)"
      }}>
        <div className="road-animate" style={{ height: "100%", borderRadius: 7, opacity: 0.6 }}/>
      </div>

      {/* Floating Card — Pickup */}
      <div className="floating-card card-float-1" style={{ position: "absolute", top: "4%", left: "-5%" }}>
        <div className="icon-circle" style={{ background: "#fff3ea" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9b6a" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <div>
          <div className="tag-label">Pickup spot</div>
          <div className="tag-value">Main Library 📍</div>
        </div>
      </div>

      {/* Floating Card — Savings */}
      <div className="floating-card card-float-2" style={{ position: "absolute", top: "38%", right: "-8%" }}>
        <div className="icon-circle" style={{ background: "#fff0f5" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f4a0c0" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="tag-label">You save</div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#e87b9e" }}>₹150/ride 💸</div>
        </div>
      </div>

      {/* Floating Card — Riders */}
      <div className="floating-card card-float-3" style={{ position: "absolute", bottom: "14%", left: "-8%" }}>
        <div className="icon-circle" style={{ background: "#fef3e8" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffb347" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </div>
        <div>
          <div className="tag-label">Active riders</div>
          <div className="tag-value">500+ students 🌟</div>
        </div>
      </div>

      {/* Wiggle sticker */}
      <div className="wiggle" style={{
        position: "absolute", top: "-2%", right: "8%",
        background: "#fdf0f8",
        border: "2px dashed #f4a0c0",
        borderRadius: 16,
        padding: "8px 14px",
        fontSize: 22,
        boxShadow: "0 4px 16px rgba(244,160,192,0.2)"
      }}>
        🚗✨
      </div>
    </div>
  );
}