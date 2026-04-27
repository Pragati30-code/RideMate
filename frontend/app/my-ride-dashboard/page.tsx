"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type MapRef } from "@/components/ui/map";
import { apiUrl, clearAuthSession, getAuthHeaders, getAuthToken } from "@/lib/api";
import { CurrentUserBooking, DriverRideBooking } from "../dashboard/types";
import MyRideDashboardHeader from "./components/MyRideDashboardHeader";
import MyRideOverview from "./components/MyRideOverview";
import MyRideMapPanel from "./components/MyRideMapPanel";
import MyRideParticipantsSection from "./components/MyRideParticipantsSection";
import RideRatingCard from "./components/RideRatingCard";
import { myRideDashboardStyles } from "./components/myRideDashboardStyles";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type WindowWithRazorpay = Window & {
  Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
};

function MyRideDashboardLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#fdf6ec 0%,#fef3e8 50%,#fdf0f8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{myRideDashboardStyles}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🌸</div>
        <p className="font-body" style={{ color: "#a09890", fontSize: 15 }}>
          Loading your ride dashboard…
        </p>
      </div>
    </div>
  );
}

export default function MyRideDashboardPage() {
  const router = useRouter();
  const mapRef = useRef<MapRef | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentBooking, setCurrentBooking] = useState<CurrentUserBooking | null>(null);
  const [participants, setParticipants] = useState<DriverRideBooking[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const loadRazorpayScript = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if ((window as WindowWithRazorpay).Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const dropMarkers = useMemo(
    () => participants.filter((booking) => typeof booking.dropLatitude === "number" && typeof booking.dropLongitude === "number"),
    [participants]
  );

  const passengerStats = useMemo(
    () => ({
      total: participants.length,
      confirmed: participants.filter((booking) => booking.status === "CONFIRMED").length,
      pickedUp: participants.filter((booking) => booking.status === "PICKED_UP").length,
      dropped: participants.filter((booking) => booking.status === "DROPPED").length,
    }),
    [participants]
  );

  const fetchCurrentBooking = async (): Promise<CurrentUserBooking | null> => {
    const res = await fetch(apiUrl("/bookings/my-current"), { headers: getAuthHeaders() });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error("Could not load booking");
    return (await res.json()) as CurrentUserBooking;
  };

  const fetchParticipants = async (rideId: number) => {
    setLoadingParticipants(true);
    try {
      const res = await fetch(apiUrl(`/bookings/ride/${rideId}/participants`), { headers: getAuthHeaders() });
      if (!res.ok) {
        setError("Unable to load participants.");
        setParticipants([]);
        return;
      }
      setParticipants((await res.json()) as DriverRideBooking[]);
    } catch {
      setError("Unable to load participants.");
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const booking = await fetchCurrentBooking();
      setCurrentBooking(booking);
      if (booking?.ride?.id) await fetchParticipants(booking.ride.id);
      else setParticipants([]);
    } catch {
      clearAuthSession();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/login");
      return;
    }
    void refresh();
  }, [router]);

  useEffect(() => {
    if (!mapRef.current || !currentBooking?.ride) return;

    const points: [number, number][] = [];
    const ride = currentBooking.ride;

    if (typeof ride.sourceLongitude === "number" && typeof ride.sourceLatitude === "number") {
      points.push([ride.sourceLongitude, ride.sourceLatitude]);
    }

    dropMarkers.forEach((booking) => points.push([booking.dropLongitude as number, booking.dropLatitude as number]));

    if (!points.length) return;
    if (points.length === 1) {
      mapRef.current.flyTo({ center: points[0], zoom: 13, duration: 600 });
      return;
    }

    const longitudes = points.map((point) => point[0]);
    const latitudes = points.map((point) => point[1]);

    mapRef.current.fitBounds(
      [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
      ],
      { padding: 60, duration: 700, maxZoom: 14 }
    );
  }, [currentBooking, dropMarkers]);

  const handleCancelBooking = async () => {
    if (!currentBooking) return;

    setCancelling(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(apiUrl(`/bookings/${currentBooking.id}/cancel`), {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        setError("Unable to cancel booking.");
        return;
      }

      setMessage("Booking cancelled successfully.");
      await refresh();
    } catch {
      setError("Unable to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayWithRazorpay = async () => {
    if (!currentBooking) return;

    setPaying(true);
    setError("");
    setMessage("");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Unable to load Razorpay checkout.");
        return;
      }

      const orderRes = await fetch(apiUrl(`/bookings/${currentBooking.id}/payments/razorpay/order`), {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!orderRes.ok) {
        setError("Unable to start payment.");
        return;
      }

      const orderData = (await orderRes.json()) as {
        keyId: string;
        orderId: string;
        amount: number;
        currency: string;
      };

      const Razorpay = (window as WindowWithRazorpay).Razorpay;
      if (!Razorpay) {
        setError("Unable to initialize Razorpay.");
        return;
      }

      new Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RideMate",
        description: `Booking #${currentBooking.id}`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch(apiUrl(`/bookings/${currentBooking.id}/payments/razorpay/verify`), {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            setError("Payment verification failed.");
            return;
          }

          setMessage("Payment successful! 🎉");
          await refresh();
        },
        prefill: {
          name: currentBooking.user?.name || "",
          email: currentBooking.user?.email || "",
          contact: currentBooking.user?.phoneNumber || "",
        },
        theme: { color: "#ff9b6a" },
        modal: { ondismiss: () => setMessage("Payment window closed.") },
      }).open();
    } catch {
      setError("Unable to process payment.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <MyRideDashboardLoading />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fdf6ec 0%,#fef3e8 55%,#fdf0f8 100%)" }}>
      <style>{myRideDashboardStyles}</style>

      <MyRideDashboardHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 20 }}>
        {error && (
          <div
            style={{
              background: "rgba(220,80,80,0.07)",
              border: "1.5px solid rgba(220,80,80,0.2)",
              borderRadius: 14,
              padding: "12px 18px",
              fontFamily: "var(--font-dm),sans-serif",
              fontSize: 14,
              color: "#c0392b",
              display: "flex",
              gap: 8,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: "rgba(100,200,120,0.08)",
              border: "1.5px solid rgba(100,200,120,0.22)",
              borderRadius: 14,
              padding: "12px 18px",
              fontFamily: "var(--font-dm),sans-serif",
              fontSize: 14,
              color: "#2e7d32",
              display: "flex",
              gap: 8,
            }}
          >
            ✅ {message}
          </div>
        )}

        {!currentBooking && (
          <div className="mrd-section">
            <p className="font-body" style={{ color: "#a09890", fontSize: 15 }}>
              No active booking found. Book a ride from your dashboard to see it here.
            </p>
          </div>
        )}

        {currentBooking && (
          <>
            <MyRideOverview
              currentBooking={currentBooking}
              cancelling={cancelling}
              paying={paying}
              onCancelBooking={handleCancelBooking}
              onPayWithRazorpay={handlePayWithRazorpay}
            />

            <MyRideMapPanel currentBooking={currentBooking} mapRef={mapRef} dropMarkers={dropMarkers} />

            <MyRideParticipantsSection
              loadingParticipants={loadingParticipants}
              participants={participants}
              passengerStats={passengerStats}
            />

            {currentBooking.status === "DROPPED" && (
              <RideRatingCard
                rideId={currentBooking.ride.id}
                driverName={currentBooking.ride.driver?.name}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
