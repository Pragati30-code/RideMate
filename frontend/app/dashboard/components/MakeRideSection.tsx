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
import { DriverStatus, Ride } from "../types";

const DEFAULT_MAP_CENTER: [number, number] = [73.8567, 18.5204];

function parseCoordinate(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type NominatimSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

type MakeRideSectionProps = {
  driverStatus: DriverStatus;
  vehicleNumber: string;
  drivingLicense: string;
  submittingVerification: boolean;
  rideSource: string;
  rideDestination: string;
  sourceLatitude: string;
  sourceLongitude: string;
  destinationLatitude: string;
  destinationLongitude: string;
  departureTime: string;
  availableSeats: string;
  myRides: Ride[];
  creatingRide: boolean;
  rideActionLoadingId: number | null;
  onVehicleNumberChange: (value: string) => void;
  onDrivingLicenseChange: (value: string) => void;
  onSubmitVerification: () => void;
  onRideSourceChange: (value: string) => void;
  onRideDestinationChange: (value: string) => void;
  onSourceLatitudeChange: (value: string) => void;
  onSourceLongitudeChange: (value: string) => void;
  onDestinationLatitudeChange: (value: string) => void;
  onDestinationLongitudeChange: (value: string) => void;
  onDepartureTimeChange: (value: string) => void;
  onAvailableSeatsChange: (value: string) => void;
  onCreateRide: () => void;
  onStartRide: (rideId: number) => void;
  onEndRide: (rideId: number) => void;
};

export default function MakeRideSection({
  driverStatus,
  vehicleNumber,
  drivingLicense,
  submittingVerification,
  rideSource,
  rideDestination,
  sourceLatitude,
  sourceLongitude,
  destinationLatitude,
  destinationLongitude,
  departureTime,
  availableSeats,
  myRides,
  creatingRide,
  rideActionLoadingId,
  onVehicleNumberChange,
  onDrivingLicenseChange,
  onSubmitVerification,
  onRideSourceChange,
  onRideDestinationChange,
  onSourceLatitudeChange,
  onSourceLongitudeChange,
  onDestinationLatitudeChange,
  onDestinationLongitudeChange,
  onDepartureTimeChange,
  onAvailableSeatsChange,
  onCreateRide,
  onStartRide,
  onEndRide,
}: MakeRideSectionProps) {
  const [sourceSuggestions, setSourceSuggestions] = useState<NominatimSuggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const mapRef = useRef<MapRef | null>(null);

  const sourcePoint = useMemo(() => {
    const latitude = parseCoordinate(sourceLatitude);
    const longitude = parseCoordinate(sourceLongitude);
    if (latitude === null || longitude === null) {
      return null;
    }
    return { latitude, longitude };
  }, [sourceLatitude, sourceLongitude]);

  const destinationPoint = useMemo(() => {
    const latitude = parseCoordinate(destinationLatitude);
    const longitude = parseCoordinate(destinationLongitude);
    if (latitude === null || longitude === null) {
      return null;
    }
    return { latitude, longitude };
  }, [destinationLatitude, destinationLongitude]);

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

  useEffect(() => {
    if (!driverStatus.isVerifiedDriver) {
      return;
    }

    const trimmed = rideSource.trim();
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
  }, [rideSource, driverStatus.isVerifiedDriver]);

  useEffect(() => {
    if (!driverStatus.isVerifiedDriver) {
      return;
    }

    const trimmed = rideDestination.trim();
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
  }, [rideDestination, driverStatus.isVerifiedDriver]);

  const selectSourceSuggestion = (suggestion: NominatimSuggestion) => {
    onRideSourceChange(suggestion.display_name);
    onSourceLatitudeChange(suggestion.lat);
    onSourceLongitudeChange(suggestion.lon);
    setSourceSuggestions([]);
  };

  const selectDestinationSuggestion = (suggestion: NominatimSuggestion) => {
    onRideDestinationChange(suggestion.display_name);
    onDestinationLatitudeChange(suggestion.lat);
    onDestinationLongitudeChange(suggestion.lon);
    setDestinationSuggestions([]);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onRideSourceChange("Current Location");
        onSourceLatitudeChange(String(position.coords.latitude));
        onSourceLongitudeChange(String(position.coords.longitude));
        setSourceSuggestions([]);
      },
      () => {
        // Ignore failure silently; user can still type manually.
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
      <h2 className="text-xl font-semibold">Create Ride</h2>

      {!driverStatus.isVerifiedDriver && (
        <div className="border border-yellow-500/40 bg-yellow-500/10 rounded-xl p-4 space-y-3">
          <p className="font-medium">Driver verification required</p>
          <p className="text-sm text-white/70">
            Before making rides, submit your driving license and vehicle number for admin verification.
          </p>
          <p className="text-sm text-white/70">
            Current status: {driverStatus.verificationStatus || "NOT_SUBMITTED"}
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-white/70">Vehicle Number</label>
              <input
                value={vehicleNumber}
                onChange={(e) => onVehicleNumberChange(e.target.value)}
                placeholder="Vehicle Number"
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-white/70">Driving License Number</label>
              <input
                value={drivingLicense}
                onChange={(e) => onDrivingLicenseChange(e.target.value)}
                placeholder="Driving License Number"
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <button
            onClick={onSubmitVerification}
            disabled={submittingVerification || !vehicleNumber || !drivingLicense}
            className="bg-white text-black font-semibold px-5 py-3 rounded-full disabled:opacity-50"
          >
            {submittingVerification ? "Submitting..." : "Submit for Verification"}
          </button>
        </div>
      )}

      {driverStatus.isVerifiedDriver && (
        <div className="space-y-4">
          <p className="text-xs text-white/50">
            Type at least 3 letters for OpenStreetMap suggestions, then select source and destination to preview route.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <label className="block text-sm text-white/70">Source</label>
              <div className="flex gap-2">
                <input
                  value={rideSource}
                  onChange={(e) => {
                    onRideSourceChange(e.target.value);
                    onSourceLatitudeChange("");
                    onSourceLongitudeChange("");
                  }}
                  placeholder="Source"
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
                />
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="px-3 rounded-xl border border-white/20 text-xs hover:bg-white/10"
                >
                  Use my location
                </button>
              </div>
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
                value={rideDestination}
                onChange={(e) => {
                  onRideDestinationChange(e.target.value);
                  onDestinationLatitudeChange("");
                  onDestinationLongitudeChange("");
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

                <MapControls
                  showZoom
                  showLocate
                  onLocate={({ latitude, longitude }) => {
                    onRideSourceChange("Current Location");
                    onSourceLatitudeChange(String(latitude));
                    onSourceLongitudeChange(String(longitude));
                    setSourceSuggestions([]);
                  }}
                />
              </Map>
            </div>
            <p className="text-xs text-white/50">
              Route line appears after selecting suggestions for both source and destination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-white/70">Departure Time</label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => onDepartureTimeChange(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-white/70">Available Seats</label>
              <input
                type="number"
                value={availableSeats}
                onChange={(e) => onAvailableSeatsChange(e.target.value)}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <button
            onClick={onCreateRide}
            disabled={creatingRide || !rideSource || !rideDestination || !departureTime}
            className="bg-white text-black font-semibold px-5 py-3 rounded-full disabled:opacity-50"
          >
            {creatingRide ? "Creating..." : "Create Ride"}
          </button>

          <div className="space-y-3 pt-3">
            <h3 className="text-lg font-semibold">My Created Rides</h3>
            {myRides.length === 0 && <p className="text-sm text-white/60">You have not created any rides yet.</p>}
            {myRides.map((ride) => (
              <div key={ride.id} className="border border-white/10 rounded-xl p-4 bg-zinc-950/40 space-y-2">
                <p className="font-semibold">
                  {ride.source} to {ride.destination}
                </p>
                <p className="text-sm text-white/60">
                  Status: {ride.status ?? "-"} | Seats: {ride.availableSeats ?? "-"}
                </p>
                {ride.departureTime && (
                  <p className="text-sm text-white/60">
                    Departure: {new Date(ride.departureTime).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/driver-dashboard?rideId=${ride.id}`}
                    className="px-4 py-2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30"
                  >
                    Track Passengers
                  </Link>

                  {(ride.status === "ACTIVE" || ride.status === "FULL") && (
                    <button
                      type="button"
                      onClick={() => onStartRide(ride.id)}
                      disabled={rideActionLoadingId === ride.id}
                      className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 disabled:opacity-60"
                    >
                      {rideActionLoadingId === ride.id ? "Starting..." : "Start Ride"}
                    </button>
                  )}

                  {ride.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      onClick={() => onEndRide(ride.id)}
                      disabled={rideActionLoadingId === ride.id}
                      className="px-4 py-2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 disabled:opacity-60"
                    >
                      {rideActionLoadingId === ride.id ? "Ending..." : "End Ride"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
