"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  type MapRef,
} from "@/components/ui/map";
import { apiUrl, clearAuthSession, getAuthHeaders, getAuthToken } from "@/lib/api";
import { CurrentUserBooking, DriverRideBooking } from "../dashboard/types";

const DEFAULT_MAP_CENTER: [number, number] = [73.8567, 18.5204];

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

  const dropMarkers = useMemo(
    () =>
      participants.filter(
        (booking) => typeof booking.dropLatitude === "number" && typeof booking.dropLongitude === "number"
      ),
    [participants]
  );

  const passengerStats = useMemo(() => {
    const total = participants.length;
    const confirmed = participants.filter((booking) => booking.status === "CONFIRMED").length;
    const pickedUp = participants.filter((booking) => booking.status === "PICKED_UP").length;
    const dropped = participants.filter((booking) => booking.status === "DROPPED").length;

    return { total, confirmed, pickedUp, dropped };
  }, [participants]);

  const fetchCurrentBooking = async (): Promise<CurrentUserBooking | null> => {
    const res = await fetch(apiUrl("/bookings/my-current"), {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (res.status === 204) {
      return null;
    }

    if (!res.ok) {
      throw new Error("Could not load your current booking");
    }

    return (await res.json()) as CurrentUserBooking;
  };

  const fetchParticipants = async (rideId: number) => {
    setLoadingParticipants(true);

    try {
      const res = await fetch(apiUrl(`/bookings/ride/${rideId}/participants`), {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        setError("Unable to load ride participants.");
        setParticipants([]);
        return;
      }

      const data = (await res.json()) as DriverRideBooking[];
      setParticipants(data);
    } catch {
      setError("Unable to load ride participants.");
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

      if (booking?.ride?.id) {
        await fetchParticipants(booking.ride.id);
      } else {
        setParticipants([]);
      }
    } catch {
      clearAuthSession();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    void refresh();
  }, [router]);

  useEffect(() => {
    if (!mapRef.current || !currentBooking?.ride) {
      return;
    }

    const points: [number, number][] = [];

    if (
      typeof currentBooking.ride.sourceLongitude === "number" &&
      typeof currentBooking.ride.sourceLatitude === "number"
    ) {
      points.push([currentBooking.ride.sourceLongitude, currentBooking.ride.sourceLatitude]);
    }

    dropMarkers.forEach((booking) => {
      points.push([booking.dropLongitude as number, booking.dropLatitude as number]);
    });

    if (points.length === 0) {
      return;
    }

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
      {
        padding: 60,
        duration: 700,
        maxZoom: 14,
      }
    );
  }, [currentBooking, dropMarkers]);

  const handleCancelBooking = async () => {
    if (!currentBooking) {
      return;
    }

    setCancelling(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(apiUrl(`/bookings/${currentBooking.id}/cancel`), {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
        },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading my ride dashboard...</div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_32%)]">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Ride Dashboard</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {error && <p className="text-red-400">{error}</p>}
        {message && <p className="text-green-400">{message}</p>}

        {!currentBooking && (
          <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
            <p className="text-white/70">No active booking found. Book a ride to see your dashboard.</p>
          </section>
        )}

        {currentBooking && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Ride Route</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">From</p>
                    <p className="mt-1 font-medium text-white/90">{currentBooking.ride.source}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">To</p>
                    <p className="mt-1 font-medium text-white/90">{currentBooking.ride.destination}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Booking Status</p>
                <p className="mt-2 font-semibold">{currentBooking.status}</p>
                <p className="text-sm text-white/60">Ride #{currentBooking.ride.id}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Seats + Fare</p>
                <p className="mt-2 font-semibold">{currentBooking.seatsBooked} seat(s)</p>
                <p className="text-sm text-white/60">
                  Rs {typeof currentBooking.estimatedFare === "number" ? currentBooking.estimatedFare.toFixed(2) : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Driver</p>
                <p className="mt-2 font-semibold">{currentBooking.ride.driver?.name || "-"}</p>
                <p className="text-sm text-white/60">{currentBooking.ride.driver?.email || "-"}</p>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-900/65 p-6 space-y-2">
                <p className="text-xs uppercase tracking-wide text-white/50">Your Stops</p>
                <p className="font-medium">Pickup: {currentBooking.pickupName || "-"}</p>
                <p className="text-white/75">Drop: {currentBooking.dropName || "-"}</p>
                <p className="text-sm text-white/60">Ride status: {currentBooking.ride.status ?? "-"}</p>
              </div>

              {currentBooking.status === "CONFIRMED" && (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-rose-200/80">Need to change plans?</p>
                    <p className="mt-2 text-sm text-white/70">You can cancel this ride before pickup or while confirmed.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="mt-4 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 disabled:opacity-60"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Ride"}
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900/65 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Passenger Drop Map</h2>
                <span className="text-xs text-white/50">Source + all passenger drops</span>
              </div>
              <div className="h-80 overflow-hidden rounded-xl border border-white/10">
                <Map
                  ref={mapRef}
                  center={
                    typeof currentBooking.ride.sourceLongitude === "number" &&
                    typeof currentBooking.ride.sourceLatitude === "number"
                      ? [currentBooking.ride.sourceLongitude, currentBooking.ride.sourceLatitude]
                      : DEFAULT_MAP_CENTER
                  }
                  zoom={12}
                  theme="dark"
                >
                  {typeof currentBooking.ride.sourceLongitude === "number" &&
                    typeof currentBooking.ride.sourceLatitude === "number" && (
                      <MapMarker longitude={currentBooking.ride.sourceLongitude} latitude={currentBooking.ride.sourceLatitude}>
                        <MarkerContent>
                          <div className="h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black/50" />
                          <MarkerLabel>Ride Source</MarkerLabel>
                        </MarkerContent>
                      </MapMarker>
                    )}

                  {dropMarkers.map((booking) => (
                    <MapMarker
                      key={booking.id}
                      longitude={booking.dropLongitude as number}
                      latitude={booking.dropLatitude as number}
                    >
                      <MarkerContent>
                        <div className="h-3 w-3 rounded-full bg-amber-400 ring-2 ring-black/50" />
                        <MarkerLabel>{booking.user?.name || `Booking ${booking.id}`}</MarkerLabel>
                      </MarkerContent>
                    </MapMarker>
                  ))}

                  <MapControls showZoom />
                </Map>
              </div>
            </section>

            {loadingParticipants ? (
              <section className="rounded-2xl border border-white/10 bg-zinc-900/65 p-6">
                <p className="text-sm text-white/60">Loading ride participants...</p>
              </section>
            ) : participants.length === 0 ? (
              <section className="rounded-2xl border border-white/10 bg-zinc-900/65 p-6">
                <p className="text-sm text-white/60">No participant data available.</p>
              </section>
            ) : (
              <>
                <section className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">Total Passengers</p>
                    <p className="mt-2 text-2xl font-semibold">{passengerStats.total}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">Confirmed</p>
                    <p className="mt-2 text-2xl font-semibold text-sky-300">{passengerStats.confirmed}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">Picked Up</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-300">{passengerStats.pickedUp}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">Dropped</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-300">{passengerStats.dropped}</p>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-zinc-900/65 p-6">
                  <h2 className="text-lg font-semibold mb-4">Passenger Details</h2>
                  <div className="overflow-x-auto border border-white/10 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-800/70 text-white/80">
                        <tr>
                          <th className="text-left px-4 py-3">Passenger</th>
                          <th className="text-left px-4 py-3">Pickup</th>
                          <th className="text-left px-4 py-3">Drop</th>
                          <th className="text-left px-4 py-3">Seats</th>
                          <th className="text-left px-4 py-3">Fare (Rs)</th>
                          <th className="text-left px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((booking) => (
                          <tr key={booking.id} className="border-t border-white/10">
                            <td className="px-4 py-3">
                              <div className="font-medium">{booking.user?.name || "-"}</div>
                              <div className="text-white/50 text-xs">{booking.user?.email || "-"}</div>
                            </td>
                            <td className="px-4 py-3">{booking.pickupName || "-"}</td>
                            <td className="px-4 py-3">{booking.dropName || "-"}</td>
                            <td className="px-4 py-3">{booking.seatsBooked}</td>
                            <td className="px-4 py-3">
                              {typeof booking.estimatedFare === "number" ? booking.estimatedFare.toFixed(2) : "-"}
                            </td>
                            <td className="px-4 py-3">{booking.status || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
