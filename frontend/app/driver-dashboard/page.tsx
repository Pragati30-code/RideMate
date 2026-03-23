"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  type MapRef,
} from "@/components/ui/map";
import { apiUrl, clearAuthSession, getAuthHeaders, getAuthToken } from "@/lib/api";
import { DriverRideBooking, Ride } from "../dashboard/types";

const DEFAULT_MAP_CENTER: [number, number] = [73.8567, 18.5204];

export default function DriverDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = useRef<MapRef | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [bookings, setBookings] = useState<DriverRideBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const dropMarkers = useMemo(
    () =>
      bookings.filter(
        (booking) => typeof booking.dropLatitude === "number" && typeof booking.dropLongitude === "number"
      ),
    [bookings]
  );

  const passengerStats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED").length;
    const pickedUp = bookings.filter((booking) => booking.status === "PICKED_UP").length;
    const dropped = bookings.filter((booking) => booking.status === "DROPPED").length;

    return { total, confirmed, pickedUp, dropped };
  }, [bookings]);

  const fetchMyRides = async () => {
    const res = await fetch(apiUrl("/rides/my-rides"), {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error("Could not load rides");
    }

    const data = (await res.json()) as Ride[];
    return [...data].sort((a, b) => b.id - a.id);
  };

  const fetchRideBookings = async (rideId: number) => {
    setLoadingBookings(true);
    setError("");

    try {
      const res = await fetch(apiUrl(`/bookings/driver/ride/${rideId}`), {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        setError("Unable to load passengers for this ride.");
        setBookings([]);
        return;
      }

      const data = (await res.json()) as DriverRideBooking[];
      setBookings(data);
    } catch {
      setError("Unable to load passengers for this ride.");
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const rideIdFromQuery = Number(searchParams.get("rideId"));
        if (!Number.isFinite(rideIdFromQuery)) {
          setError("No ride selected. Open this page from Track Passengers.");
          setSelectedRide(null);
          return;
        }

        const rides = await fetchMyRides();
        const matchedRide = rides.find((ride) => ride.id === rideIdFromQuery) ?? null;

        if (!matchedRide) {
          setError("Selected ride not found.");
          setSelectedRide(null);
          return;
        }

        setSelectedRide(matchedRide);
        await fetchRideBookings(rideIdFromQuery);
      } catch {
        clearAuthSession();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [router, searchParams]);

  useEffect(() => {
    if (!mapRef.current || !selectedRide) {
      return;
    }

    const points: [number, number][] = [];

    if (typeof selectedRide.sourceLongitude === "number" && typeof selectedRide.sourceLatitude === "number") {
      points.push([selectedRide.sourceLongitude, selectedRide.sourceLatitude]);
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
  }, [selectedRide, dropMarkers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading driver dashboard...</div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_30%)]">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
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

        {selectedRide && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Route</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">From</p>
                    <p className="mt-1 font-medium text-white/90">{selectedRide.source}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/45">To</p>
                    <p className="mt-1 font-medium text-white/90">{selectedRide.destination}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Ride Status</p>
                <p className="mt-2 font-semibold">{selectedRide.status ?? "-"}</p>
                <p className="text-sm text-white/60">Seats Left: {selectedRide.availableSeats ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Driver</p>
                <p className="mt-2 font-semibold">{selectedRide.driver?.name || "-"}</p>
                <p className="text-sm text-white/60">{selectedRide.driver?.email || "-"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Ride ID</p>
                <p className="mt-2 font-semibold">#{selectedRide.id}</p>
                <p className="text-sm text-white/60">Tracking active passengers</p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900/65 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Passenger Drop Map</h2>
                <span className="text-xs text-white/50">Source + all drop points</span>
              </div>
              <div className="h-80 overflow-hidden rounded-xl border border-white/10">
                <Map
                  ref={mapRef}
                  center={
                    typeof selectedRide.sourceLongitude === "number" && typeof selectedRide.sourceLatitude === "number"
                      ? [selectedRide.sourceLongitude, selectedRide.sourceLatitude]
                      : DEFAULT_MAP_CENTER
                  }
                  zoom={12}
                  theme="dark"
                >
                  {typeof selectedRide.sourceLongitude === "number" &&
                    typeof selectedRide.sourceLatitude === "number" && (
                      <MapMarker longitude={selectedRide.sourceLongitude} latitude={selectedRide.sourceLatitude}>
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

            <section className="rounded-2xl border border-white/10 bg-zinc-900/65 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Passenger Details</h2>
              {loadingBookings ? (
                <p className="text-sm text-white/60">Loading passengers...</p>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-white/60">No bookings yet for this ride.</p>
              ) : (
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
                      {bookings.map((booking) => (
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
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
