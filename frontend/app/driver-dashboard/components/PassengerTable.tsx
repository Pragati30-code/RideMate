import { DriverRideBooking } from "@/app/dashboard/types";
import { statusBadgeClass } from "./statusBadge";

type PassengerTableProps = {
  loadingBookings: boolean;
  bookings: DriverRideBooking[];
  selectedRideStatus?: string;
  passengerActionLoadingId: number | null;
  onPickupPassenger: (bookingId: number) => void;
  onDropPassenger: (bookingId: number) => void;
};

export default function PassengerTable({
  loadingBookings,
  bookings,
  selectedRideStatus,
  passengerActionLoadingId,
  onPickupPassenger,
  onDropPassenger,
}: PassengerTableProps) {
  return (
    <div className="dd-section">
      <h2 className="font-display" style={{ fontSize: 19, fontWeight: 800, color: "#1e1e1e", letterSpacing: "-0.4px", marginBottom: 20 }}>
        Passenger Details
      </h2>
      {loadingBookings ? (
        <p className="font-body" style={{ color: "#a09890", fontSize: 14 }}>
          Loading passengers…
        </p>
      ) : bookings.length === 0 ? (
        <p className="font-body" style={{ color: "#a09890", fontSize: 14 }}>
          No bookings yet for this ride.
        </p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1.5px solid rgba(45,45,45,0.08)" }}>
          <table className="dd-table">
            <thead>
              <tr>
                {["Passenger", "Pickup", "Drop", "Seats", "Fare (₹)", "Status", "Action"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
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
                    <span className={`dd-status-badge ${statusBadgeClass(b.status)}`}>{b.status || "-"}</span>
                  </td>
                  <td>
                    {selectedRideStatus !== "IN_PROGRESS" ? (
                      <span style={{ fontSize: 12, color: "#c0b8b2" }}>Start ride first</span>
                    ) : b.status === "CONFIRMED" ? (
                      <button
                        className="dd-btn dd-btn-blue"
                        onClick={() => onPickupPassenger(b.id)}
                        disabled={passengerActionLoadingId === b.id}
                      >
                        {passengerActionLoadingId === b.id ? "Updating…" : "Picked Up"}
                      </button>
                    ) : b.status === "PICKED_UP" ? (
                      <button
                        className="dd-btn dd-btn-red"
                        onClick={() => onDropPassenger(b.id)}
                        disabled={passengerActionLoadingId === b.id}
                      >
                        {passengerActionLoadingId === b.id ? "Ending…" : "Drop Off"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "#c0b8b2" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
