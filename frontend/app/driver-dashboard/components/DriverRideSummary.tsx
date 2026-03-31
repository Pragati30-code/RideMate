import { Ride } from "@/app/dashboard/types";
import { statusBadgeClass } from "./statusBadge";

type PassengerStats = {
  total: number;
  confirmed: number;
  pickedUp: number;
  dropped: number;
};

type DriverRideSummaryProps = {
  selectedRide: Ride;
  passengerStats: PassengerStats;
  rideActionLoading: "start" | "end" | null;
  onStartRide: () => void;
  onEndRide: () => void;
};

export default function DriverRideSummary({
  selectedRide,
  passengerStats,
  rideActionLoading,
  onStartRide,
  onEndRide,
}: DriverRideSummaryProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
      <div className="dd-card">
        <span className="dd-label">Route</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <div className="dd-route-block">
            <span className="dd-label" style={{ marginBottom: 2 }}>
              From
            </span>
            <p className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "#1e1e1e" }}>
              {selectedRide.source}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", color: "#ff9b6a", fontSize: 18 }}>↓</div>
          <div className="dd-route-block">
            <span className="dd-label" style={{ marginBottom: 2 }}>
              To
            </span>
            <p className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "#1e1e1e" }}>
              {selectedRide.destination}
            </p>
          </div>
        </div>
      </div>

      <div className="dd-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span className="dd-label">Ride Status</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className={`dd-status-badge ${statusBadgeClass(selectedRide.status)}`}>{selectedRide.status ?? "-"}</span>
          <span className="font-body" style={{ fontSize: 13, color: "#a09890" }}>
            #{selectedRide.id}
          </span>
        </div>
        <div>
          <span className="dd-label">Seats Left</span>
          <span className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "#1e1e1e" }}>
            {selectedRide.availableSeats ?? "-"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(selectedRide.status === "ACTIVE" || selectedRide.status === "FULL") && (
            <button className="dd-btn dd-btn-green" onClick={onStartRide} disabled={rideActionLoading !== null}>
              {rideActionLoading === "start" ? (
                <>
                  <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Starting…
                </>
              ) : (
                "▶ Start Ride"
              )}
            </button>
          )}
          {selectedRide.status === "IN_PROGRESS" && (
            <button className="dd-btn dd-btn-red" onClick={onEndRide} disabled={rideActionLoading !== null}>
              {rideActionLoading === "end" ? "Ending…" : "⏹ End Ride"}
            </button>
          )}
        </div>
      </div>

      <div className="dd-card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="dd-label">Driver</span>
        <p className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#1e1e1e", marginBottom: 4 }}>
          {selectedRide.driver?.name || "-"}
        </p>
        {[
          { l: "Email", v: selectedRide.driver?.email },
          { l: "Phone", v: selectedRide.driver?.phoneNumber },
          { l: "Gender", v: selectedRide.driver?.gender },
          { l: "Vehicle", v: `${selectedRide.driver?.vehicleModel || "-"} · ${selectedRide.driver?.vehicleNumber || "-"}` },
        ].map(({ l, v }) => (
          <div key={l}>
            <span className="dd-label" style={{ marginBottom: 0 }}>
              {l}{" "}
            </span>
            <span className="dd-value">{v || "-"}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Total", value: passengerStats.total, color: "#1e1e1e" },
          { label: "Confirmed", value: passengerStats.confirmed, color: "#1a5ea8" },
          { label: "Picked Up", value: passengerStats.pickedUp, color: "#a07010" },
          { label: "Dropped", value: passengerStats.dropped, color: "#2e7d32" },
        ].map(({ label, value, color }) => (
          <div key={label} className="dd-stat-card">
            <span className="dd-label">{label}</span>
            <p className="font-display" style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
