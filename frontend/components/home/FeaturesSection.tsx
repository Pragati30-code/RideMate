const features = [
  {
    emoji: "⚡",
    color:  "#fff8ea",
    accent: "#ffb347",
    title: "Instant Matching",
    desc:  "Find rides going your way in seconds. Our smart algorithm matches you with the perfect carpool buddy.",
  },
  {
    emoji: "🛡️",
    color:  "#fff0f5",
    accent: "#f4a0c0",
    title: "Verified Students Only",
    desc:  "Ride only with verified college students. Your safety is our top priority with college ID verification.",
  },
  {
    emoji: "🌿",
    color:  "#f0faf0",
    accent: "#7ec87e",
    title: "Eco Friendly",
    desc:  "Reduce your carbon footprint while saving money. Track your environmental impact with every ride.",
  },
];

export default function FeaturesSection() {
  return (
    <section style={{
      background:    "rgba(255,255,255,0.4)",
      borderTop:     "1.5px solid rgba(255,255,255,0.8)",
      backdropFilter:"blur(8px)",
      padding:       "80px 0",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-pill">✦ Why students love it</div>
          <h2 className="font-display" style={{
            fontSize:      "clamp(32px, 4vw, 52px)",
            fontWeight:    800,
            color:         "#1e1e1e",
            letterSpacing: "-1.5px",
          }}>
            Everything you need,
            <span style={{ fontStyle: "italic", color: "#ff9b6a" }}> nothing you don't.</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap:                 24,
        }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{
                width:         56,
                height:        56,
                background:    f.color,
                borderRadius:  16,
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                fontSize:      26,
                marginBottom:  20,
                border:        `1.5px solid ${f.accent}30`,
              }}>
                {f.emoji}
              </div>
              <h3 className="font-display" style={{
                fontSize:      22,
                fontWeight:    700,
                color:         "#1e1e1e",
                marginBottom:  10,
                letterSpacing: "-0.5px",
              }}>
                {f.title}
              </h3>
              <p className="font-body" style={{ color: "#7a7370", lineHeight: 1.7, fontSize: 15 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}