import { DashboardMode } from "../types";

type ModeSwitchProps = {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
};

export default function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  const options: { key: DashboardMode; emoji: string; title: string; desc: string }[] = [
    { key: "book", emoji: "🔍", title: "Book a Ride", desc: "Find available rides by route" },
    { key: "make", emoji: "🚗", title: "Make a Ride", desc: "Offer your ride to other students" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
      {options.map(({ key, emoji, title, desc }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            style={{
              background: active ? "rgba(255,155,106,0.1)" : "rgba(255,255,255,0.6)",
              border: active ? "1.5px solid rgba(255,155,106,0.45)" : "1.5px solid rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: "20px 22px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: active
                ? "0 4px 20px rgba(255,155,106,0.15)"
                : "0 2px 12px rgba(180,140,100,0.06)",
              backdropFilter: "blur(12px)",
            }}
            onMouseOver={e => { if (!active) (e.currentTarget.style.background = "rgba(255,255,255,0.8)"); }}
            onMouseOut={e => { if (!active) (e.currentTarget.style.background = "rgba(255,255,255,0.6)"); }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
            <p className="font-display" style={{
              fontSize: 17,
              fontWeight: 700,
              color: active ? "#cc6b3d" : "#1e1e1e",
              letterSpacing: "-0.3px",
              marginBottom: 4,
            }}>
              {title}
            </p>
            <p className="font-body" style={{ fontSize: 13, color: "#a09890" }}>
              {desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}