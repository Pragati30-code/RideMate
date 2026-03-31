import { DriverRideBooking } from "@/app/dashboard/types";
import { statusBadgeClass } from "./statusBadge";

type PassengerTableProps = {
  loadingBookings: boolean;
  bookings: DriverRideBooking[];
  selectedRideStatus?: string;
  passengerActionLoadingId: number | null;
  otpModalBooking: DriverRideBooking | null;
  pickupOtpValue: string;
  pickupOtpError: string;
  onPickupOtpValueChange: (value: string) => void;
  onOpenPickupOtpModal: (booking: DriverRideBooking) => void;
  onClosePickupOtpModal: () => void;
  onConfirmPickupOtp: (bookingId: number) => void;
  onDropPassenger: (bookingId: number) => void;
};

export default function PassengerTable({
  loadingBookings,
  bookings,
  selectedRideStatus,
  passengerActionLoadingId,
  otpModalBooking,
  pickupOtpValue,
  pickupOtpError,
  onPickupOtpValueChange,
  onOpenPickupOtpModal,
  onClosePickupOtpModal,
  onConfirmPickupOtp,
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
                        onClick={() => onOpenPickupOtpModal(b)}
                        disabled={passengerActionLoadingId === b.id}
                      >
                        Verify Pickup OTP
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

      {otpModalBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "rgba(255,255,255,0.95)",
              border: "1.5px solid rgba(45,45,45,0.12)",
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <h3 className="font-display" style={{ fontSize: 20, color: "#1e1e1e", marginBottom: 8 }}>
              Confirm Passenger Pickup
            </h3>
            <p className="font-body" style={{ fontSize: 13, color: "#7a7370", marginBottom: 12 }}>
              Enter OTP for {otpModalBooking.user?.name || "this passenger"}.
            </p>
            <input
              value={pickupOtpValue}
              onChange={(e) => onPickupOtpValueChange(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              style={{
                width: "100%",
                border: "1.5px solid rgba(45,45,45,0.18)",
                borderRadius: 12,
                padding: "12px 14px",
                fontFamily: "var(--font-dm), sans-serif",
                fontSize: 15,
                marginBottom: 8,
              }}
            />
            {pickupOtpError && (
              <p className="font-body" style={{ fontSize: 12, color: "#c0392b", marginBottom: 10 }}>
                {pickupOtpError}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="dd-btn" style={{ background: "rgba(45,45,45,0.08)", color: "#3a3530" }} onClick={onClosePickupOtpModal}>
                Cancel
              </button>
              <button
                className="dd-btn dd-btn-blue"
                onClick={() => onConfirmPickupOtp(otpModalBooking.id)}
                disabled={passengerActionLoadingId === otpModalBooking.id}
              >
                {passengerActionLoadingId === otpModalBooking.id ? "Verifying…" : "Confirm Pickup"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
