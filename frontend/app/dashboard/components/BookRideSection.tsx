import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  type MapRef,
} from "@/components/ui/map";
import { Ride, SearchRideResult } from "../types";

type NominatimSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

const DEFAULT_MAP_CENTER: [number, number] = [73.8567, 18.5204];

function parseCoordinate(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type BookRideSectionProps = {
  searchSource: string;
  searchDestination: string;
  searchSourceLatitude: string;
  searchSourceLongitude: string;
  searchDestinationLatitude: string;
  searchDestinationLongitude: string;
  searchedRides: SearchRideResult[];
  activeRides: Ride[];
  onSearchSourceChange: (value: string) => void;
  onSearchDestinationChange: (value: string) => void;
  onSearchSourceLatitudeChange: (value: string) => void;
  onSearchSourceLongitudeChange: (value: string) => void;
  onSearchDestinationLatitudeChange: (value: string) => void;
  onSearchDestinationLongitudeChange: (value: string) => void;
  onSearch: () => void;
  onBookRide: (rideId: number, seats: number) => void;
  bookingRideId: number | null;
};

export default function BookRideSection({
  searchSource,
  searchDestination,
  searchSourceLatitude,
  searchSourceLongitude,
  searchDestinationLatitude,
  searchDestinationLongitude,
  searchedRides,
  activeRides,
  onSearchSourceChange,
  onSearchDestinationChange,
  onSearchSourceLatitudeChange,
  onSearchSourceLongitudeChange,
  onSearchDestinationLatitudeChange,
  onSearchDestinationLongitudeChange,
  onSearch,
  onBookRide,
  bookingRideId,
}: BookRideSectionProps) {
  const [sourceSuggestions, setSourceSuggestions] = useState<NominatimSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [seatsByRide, setSeatsByRide] = useState<Record<number, string>>({});
  const mapRef = useRef<MapRef | null>(null);

  const sourcePoint = useMemo(() => {
    const latitude = parseCoordinate(searchSourceLatitude);
    const longitude = parseCoordinate(searchSourceLongitude);
    if (latitude === null || longitude === null) {
      return null;
    }
    return { latitude, longitude };
  }, [searchSourceLatitude, searchSourceLongitude]);

  const destinationPoint = useMemo(() => {
    const latitude = parseCoordinate(searchDestinationLatitude);
    const longitude = parseCoordinate(searchDestinationLongitude);
    if (latitude === null || longitude === null) {
      return null;
    }
    return { latitude, longitude };
  }, [searchDestinationLatitude, searchDestinationLongitude]);

  const routeCoordinates = useMemo<[number, number][]>(() => {
    if (!sourcePoint || !destinationPoint) {
      return [];
    }

    return [
      [sourcePoint.longitude, sourcePoint.latitude],
      [destinationPoint.longitude, destinationPoint.latitude],
    ];
  }, [sourcePoint, destinationPoint]);

  useEffect(() => {
    const trimmed = searchSource.trim();
    if (trimmed.length < 3) {
      setSourceSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingSource(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) {
          setSourceSuggestions([]);
          return;
        }
        const data = (await res.json()) as NominatimSuggestion[];
        setSourceSuggestions(data);
      } catch {
        setSourceSuggestions([]);
      } finally {
        setIsSearchingSource(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchSource]);

  useEffect(() => {
    const trimmed = searchDestination.trim();
    if (trimmed.length < 3) {
      setDestinationSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingDestination(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) {
          setDestinationSuggestions([]);
          return;
        }
        const data = (await res.json()) as NominatimSuggestion[];
        setDestinationSuggestions(data);
      } catch {
        setDestinationSuggestions([]);
      } finally {
        setIsSearchingDestination(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchDestination]);

  useEffect(() => {
    if (!mapRef.current || !sourcePoint || !destinationPoint) {
      return;
    }

    const minLongitude = Math.min(sourcePoint.longitude, destinationPoint.longitude);
    const maxLongitude = Math.max(sourcePoint.longitude, destinationPoint.longitude);
    const minLatitude = Math.min(sourcePoint.latitude, destinationPoint.latitude);
    const maxLatitude = Math.max(sourcePoint.latitude, destinationPoint.latitude);

    mapRef.current.fitBounds(
      [
        [minLongitude, minLatitude],
        [maxLongitude, maxLatitude],
      ],
      {
        padding: 60,
        duration: 700,
        maxZoom: 15,
      }
    );
  }, [sourcePoint, destinationPoint]);

  const selectSourceSuggestion = (suggestion: NominatimSuggestion) => {
    onSearchSourceChange(suggestion.display_name);
    onSearchSourceLatitudeChange(suggestion.lat);
    onSearchSourceLongitudeChange(suggestion.lon);
    setSourceSuggestions([]);
  };

  const selectDestinationSuggestion = (suggestion: NominatimSuggestion) => {
    onSearchDestinationChange(suggestion.display_name);
    onSearchDestinationLatitudeChange(suggestion.lat);
    onSearchDestinationLongitudeChange(suggestion.lon);
    setDestinationSuggestions([]);
  };

  return (
    <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold">Search Rides</h2>
      <div>
        <Link
          href="/my-ride-dashboard"
          className="inline-flex px-4 py-2 rounded-full border border-sky-400/40 text-sky-300 hover:bg-sky-500/10 transition-colors"
        >
          Open My Ride Dashboard
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 relative">
          <label className="block text-sm text-white/70">Source</label>
          <input
            value={searchSource}
            onChange={(e) => {
              onSearchSourceChange(e.target.value);
              onSearchSourceLatitudeChange("");
              onSearchSourceLongitudeChange("");
            }}
            placeholder="Source"
            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
          />
          {isSearchingSource && <p className="text-xs text-white/40">Searching...</p>}
          {sourceSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-zinc-950 border border-white/10 rounded-xl overflow-hidden">
              {sourceSuggestions.map((suggestion) => (
                <button
                  key={`${suggestion.lat}-${suggestion.lon}-${suggestion.display_name}`}
                  type="button"
                  onClick={() => selectSourceSuggestion(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 relative">
          <label className="block text-sm text-white/70">Destination</label>
          <input
            value={searchDestination}
            onChange={(e) => {
              onSearchDestinationChange(e.target.value);
              onSearchDestinationLatitudeChange("");
              onSearchDestinationLongitudeChange("");
            }}
            placeholder="Destination"
            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
          />
          {isSearchingDestination && <p className="text-xs text-white/40">Searching...</p>}
          {destinationSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-zinc-950 border border-white/10 rounded-xl overflow-hidden">
              {destinationSuggestions.map((suggestion) => (
                <button
                  key={`${suggestion.lat}-${suggestion.lon}-${suggestion.display_name}`}
                  type="button"
                  onClick={() => selectDestinationSuggestion(suggestion)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={onSearch} className="bg-white text-black font-semibold px-5 py-3 rounded-full">
        Search
      </button>

      <div className="space-y-2">
        <label className="block text-sm text-white/70">Route Preview</label>
        <div className="h-72 overflow-hidden rounded-xl border border-white/10">
          <Map
            ref={mapRef}
            center={sourcePoint ? [sourcePoint.longitude, sourcePoint.latitude] : DEFAULT_MAP_CENTER}
            zoom={12}
            theme="dark"
          >
            {sourcePoint && (
              <MapMarker longitude={sourcePoint.longitude} latitude={sourcePoint.latitude}>
                <MarkerContent>
                  <div className="h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black/50" />
                  <MarkerLabel>Source</MarkerLabel>
                </MarkerContent>
              </MapMarker>
            )}

            {destinationPoint && (
              <MapMarker longitude={destinationPoint.longitude} latitude={destinationPoint.latitude}>
                <MarkerContent>
                  <div className="h-3 w-3 rounded-full bg-rose-400 ring-2 ring-black/50" />
                  <MarkerLabel>Destination</MarkerLabel>
                </MarkerContent>
              </MapMarker>
            )}

            {routeCoordinates.length === 2 && (
              <MapRoute coordinates={routeCoordinates} color="#22d3ee" width={4} opacity={0.85} />
            )}

            <MapControls showZoom />
          </Map>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-lg font-semibold">Search Results</h3>
        {searchedRides.length === 0 && <p className="text-sm text-white/60">No searched rides yet.</p>}
        {searchedRides.map(({ ride, estimatedFare, segmentDistanceKm }) => {
          const seatsValue = Math.max(1, Number(seatsByRide[ride.id] ?? "1") || 1);
          const totalFare = estimatedFare * seatsValue;
          const seatsExceeded =
            typeof ride.availableSeats === "number" && ride.availableSeats > 0
              ? seatsValue > ride.availableSeats
              : false;

          return (
          <div key={ride.id} className="border border-white/10 rounded-xl p-4 bg-zinc-950/40">
            <p className="font-semibold">
              {ride.source} to {ride.destination}
            </p>
            <p className="text-sm text-white/60">
              Seats: {ride.availableSeats ?? "-"} | Status: {ride.status ?? "-"}
            </p>
            <p className="text-sm text-white/60">
              Driver: {ride.driver?.name || "-"} ({ride.driver?.email || "-"})
            </p>
            <p className="text-sm text-emerald-300">
              Fare for 1 seat: Rs {Number(estimatedFare).toFixed(2)} | Segment: {Number(segmentDistanceKm).toFixed(2)} km
            </p>
            <p className="text-sm text-emerald-300">
              Total Fare ({seatsValue} seat{seatsValue > 1 ? "s" : ""}): Rs {Number(totalFare).toFixed(2)}
            </p>
            {ride.departureTime && (
              <p className="text-sm text-white/60">
                Departure: {new Date(ride.departureTime).toLocaleString()}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="block text-xs text-white/60">Seats</label>
                <input
                  type="number"
                  min={1}
                  value={seatsByRide[ride.id] ?? "1"}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSeatsByRide((prev) => ({ ...prev, [ride.id]: next }));
                  }}
                  className="w-24 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={() => onBookRide(ride.id, Number(seatsByRide[ride.id] ?? "1"))}
                disabled={
                  bookingRideId === ride.id ||
                  ride.status !== "ACTIVE" ||
                  (ride.availableSeats ?? 0) <= 0 ||
                  seatsExceeded
                }
                className="px-4 py-2 rounded-full bg-white text-black font-semibold disabled:opacity-50"
              >
                {bookingRideId === ride.id ? "Booking..." : "Book Ride"}
              </button>
            </div>

            {seatsExceeded && (
              <p className="text-xs text-red-300 mt-2">
                Selected seats exceed available seats for this ride.
              </p>
            )}

            {ride.status !== "ACTIVE" && (
              <p className="text-xs text-amber-300 mt-2">
                This ride is currently {ride.status}. Booking is available only for ACTIVE rides.
              </p>
            )}
          </div>
        )})}
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-lg font-semibold">All Active Rides</h3>
        {activeRides.length === 0 && <p className="text-sm text-white/60">No active rides available right now.</p>}
        {activeRides.map((ride) => (
          <div key={ride.id} className="border border-white/10 rounded-xl p-4 bg-zinc-950/40">
            <p className="font-semibold">
              {ride.source} to {ride.destination}
            </p>
            <p className="text-sm text-white/60">
              Seats: {ride.availableSeats ?? "-"} | Status: {ride.status ?? "-"}
            </p>
            <p className="text-sm text-white/60">
              Driver: {ride.driver?.name || "-"} ({ride.driver?.email || "-"})
            </p>
            {typeof ride.distanceKm === "number" && (
              <p className="text-sm text-white/60">Distance: {ride.distanceKm.toFixed(2)} km</p>
            )}
            {ride.departureTime && (
              <p className="text-sm text-white/60">
                Departure: {new Date(ride.departureTime).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
