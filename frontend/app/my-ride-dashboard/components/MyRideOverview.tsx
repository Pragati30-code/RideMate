import { CurrentUserBooking } from "@/app/dashboard/types";
import { statusBadgeClass } from "./statusBadge";

type MyRideOverviewProps = {
  currentBooking: CurrentUserBooking;
  cancelling: boolean;
  paying: boolean;
  onCancelBooking: () => void;
  onPayWithRazorpay: () => void;
};

export default function MyRideOverview({
  currentBooking,
  cancelling,
  paying,
  onCancelBooking,
  onPayWithRazorpay,
}: MyRideOverviewProps) {
  return (
    <>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.7)",
          border: "1.5px solid rgba(45,45,45,0.1)",
          borderRadius: 50,
          padding: "6px 16px",
          alignSelf: "flex-start",
        }}
      >
        <span className="mrd-label" style={{ marginBottom: 0 }}>
          Ride
        </span>
        <span className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "#1e1e1e" }}>
          #{currentBooking.ride.id}
        </span>
        <span className={`mrd-status-badge ${statusBadgeClass(currentBooking.ride.status)}`}>{currentBooking.ride.status}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <div className="mrd-card">
          <span className="mrd-label">Route</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            <div className="mrd-route-block">
              <span className="mrd-label" style={{ marginBottom: 2 }}>
                From
              </span>
              <p className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "#1e1e1e" }}>
                {currentBooking.ride.source}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", color: "#ff9b6a", fontSize: 18 }}>↓</div>
            <div className="mrd-route-block">
              <span className="mrd-label" style={{ marginBottom: 2 }}>
                To
              </span>
              <p className="font-body" style={{ fontSize: 14, fontWeight: 600, color: "#1e1e1e" }}>
                {currentBooking.ride.destination}
              </p>
            </div>
          </div>
        </div>

        <div className="mrd-card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="mrd-label">Driver</span>
          <p className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "#1e1e1e", marginBottom: 4 }}>
            {currentBooking.ride.driver?.name || "-"}
          </p>
          {[
            { l: "Email", v: currentBooking.ride.driver?.email },
            { l: "Phone", v: currentBooking.ride.driver?.phoneNumber },
            { l: "Gender", v: currentBooking.ride.driver?.gender },
            { l: "Vehicle", v: `${currentBooking.ride.driver?.vehicleModel || "-"} · ${currentBooking.ride.driver?.vehicleNumber || "-"}` },
          ].map(({ l, v }) => (
            <div key={l}>
              <span className="mrd-label" style={{ marginBottom: 0 }}>
                {l}{" "}
              </span>
              <span className="mrd-value">{v || "-"}</span>
            </div>
          ))}
        </div>

        <div className="mrd-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="mrd-label">Your Journey</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="mrd-route-block">
              <span className="mrd-label" style={{ marginBottom: 2 }}>
                Pickup
              </span>
              <p className="font-body" style={{ fontSize: 13, color: "#1e1e1e", fontWeight: 500 }}>
                {currentBooking.pickupName || "-"}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", color: "#ff9b6a" }}>↓</div>
            <div className="mrd-route-block">
              <span className="mrd-label" style={{ marginBottom: 2 }}>
                Drop
              </span>
              <p className="font-body" style={{ fontSize: 13, color: "#1e1e1e", fontWeight: 500 }}>
                {currentBooking.dropName || "-"}
              </p>
            </div>
          </div>
          <div className="mrd-fare-box">
            <div>
              <span className="mrd-label" style={{ marginBottom: 0 }}>
                Seats
              </span>
              <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#1e1e1e" }}>
                {currentBooking.seatsBooked}
              </p>
            </div>
            <div>
              <span className="mrd-label" style={{ marginBottom: 0 }}>
                Fare
              </span>
              <p className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "#cc6b3d" }}>
                ₹{typeof currentBooking.estimatedFare === "number" ? currentBooking.estimatedFare.toFixed(2) : "-"}
              </p>
            </div>
            <div>
              <span className="mrd-label" style={{ marginBottom: 0 }}>
                Payment
              </span>
              <span className={`mrd-status-badge ${currentBooking.paymentStatus === "PAID" ? "badge-paid" : "badge-unpaid"}`}>
                {currentBooking.paymentStatus || "UNPAID"}
              </span>
            </div>
          </div>
          {currentBooking.paymentId && (
            <p className="font-body" style={{ fontSize: 12, color: "#a09890" }}>
              Payment ID: {currentBooking.paymentId}
            </p>
          )}
        </div>

        <div className="mrd-card" style={{ display: "flex", flexDirection: "column", gap: 12, justifyContent: "space-between" }}>
          <div>
            <span className="mrd-label">Actions</span>
            <p className="font-body" style={{ fontSize: 13, color: "#a09890", marginTop: 6, lineHeight: 1.6 }}>
              {currentBooking.status === "DROPPED" && currentBooking.paymentStatus !== "PAID"
                ? "Your ride is complete. Pay now to finish."
                : currentBooking.status === "DROPPED"
                  ? "Ride complete and payment done. Thanks for riding! 🌸"
                  : "Payment unlocks once the driver marks your drop-off."}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currentBooking.status === "DROPPED" && currentBooking.paymentStatus !== "PAID" && (
              <button className="mrd-btn mrd-btn-accent" onClick={onPayWithRazorpay} disabled={paying}>
                {paying ? (
                  <>
                    <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Opening…
                  </>
                ) : (
                  "💳 Pay with Razorpay"
                )}
              </button>
            )}
            {currentBooking.status === "CONFIRMED" && (
              <button className="mrd-btn mrd-btn-red" onClick={onCancelBooking} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Cancel Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
