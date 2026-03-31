import { DriverRideBooking } from "@/app/dashboard/types";
import { statusBadgeClass } from "./statusBadge";

type PassengerStats = {
  total: number;
  confirmed: number;
  pickedUp: number;
  dropped: number;
};

type MyRideParticipantsSectionProps = {
  loadingParticipants: boolean;
  participants: DriverRideBooking[];
  passengerStats: PassengerStats;
};

export default function MyRideParticipantsSection({
  loadingParticipants,
  participants,
  passengerStats,
}: MyRideParticipantsSectionProps) {
  if (loadingParticipants) {
    return (
      <div className="mrd-section">
        <p className="font-body" style={{ color: "#a09890", fontSize: 14 }}>
          Loading participants…
        </p>
      </div>
    );
  }

  if (!participants.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: passengerStats.total, color: "#1e1e1e" },
          { label: "Confirmed", value: passengerStats.confirmed, color: "#1a5ea8" },
          { label: "Picked Up", value: passengerStats.pickedUp, color: "#a07010" },
          { label: "Dropped", value: passengerStats.dropped, color: "#2e7d32" },
        ].map(({ label, value, color }) => (
          <div key={label} className="mrd-stat-card">
            <span className="mrd-label">{label}</span>
            <p className="font-display" style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mrd-section">
        <h2 className="font-display" style={{ fontSize: 19, fontWeight: 800, color: "#1e1e1e", letterSpacing: "-0.4px", marginBottom: 20 }}>
          Fellow Passengers
        </h2>
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1.5px solid rgba(45,45,45,0.08)" }}>
          <table className="mrd-table">
            <thead>
              <tr>
                {["Passenger", "Pickup", "Drop", "Seats", "Fare (₹)", "Status"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#1e1e1e" }}>{b.user?.name || "-"}</div>
                    <div style={{ fontSize: 12, color: "#a09890" }}>{b.user?.email || "-"}</div>
                  </td>
                  <td>{b.pickupName || "-"}</td>
                  <td>{b.dropName || "-"}</td>
                  <td>{b.seatsBooked}</td>
                  <td style={{ fontWeight: 600, color: "#cc6b3d" }}>
                    {typeof b.estimatedFare === "number" ? b.estimatedFare.toFixed(2) : "-"}
                  </td>
                  <td>
                    <span className={`mrd-status-badge ${statusBadgeClass(b.status)}`}>{b.status || "-"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
