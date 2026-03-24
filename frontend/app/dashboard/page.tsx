"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiUrl,
  getAuthHeaders,
  getAuthToken,
  clearAuthSession,
} from "@/lib/api";
import DashboardHeader from "./components/DashboardHeader";
import ModeSwitch from "./components/ModeSwitch";
import BookRideSection from "./components/BookRideSection";
import MakeRideSection from "./components/MakeRideSection";
import {
  DashboardMode,
  DriverStatus,
  Ride,
  SearchRideResult,
  defaultDriverStatus,
} from "./types";

export default function DashboardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<DashboardMode>("book");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [driverStatus, setDriverStatus] =
    useState<DriverStatus>(defaultDriverStatus);

  const [searchSource, setSearchSource] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [searchSourceLatitude, setSearchSourceLatitude] = useState("");
  const [searchSourceLongitude, setSearchSourceLongitude] = useState("");
  const [searchDestinationLatitude, setSearchDestinationLatitude] =
    useState("");
  const [searchDestinationLongitude, setSearchDestinationLongitude] =
    useState("");
  const [searchedRides, setSearchedRides] = useState<SearchRideResult[]>([]);
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [bookingRideId, setBookingRideId] = useState<number | null>(null);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const [rideSource, setRideSource] = useState("");
  const [rideDestination, setRideDestination] = useState("");
  const [sourceLatitude, setSourceLatitude] = useState("");
  const [sourceLongitude, setSourceLongitude] = useState("");
  const [destinationLatitude, setDestinationLatitude] = useState("");
  const [destinationLongitude, setDestinationLongitude] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");
  const [creatingRide, setCreatingRide] = useState(false);

  const fetchDriverStatus = async () => {
    const res = await fetch(apiUrl("/users/driver-status"), {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error("Could not load driver status");
    }

    const data = (await res.json()) as DriverStatus;
    setDriverStatus(data);
    if (data.vehicleNumber) setVehicleNumber(data.vehicleNumber);
    if (data.vehicleModel) setVehicleModel(data.vehicleModel);
    if (data.drivingLicense) setDrivingLicense(data.drivingLicense);
  };

  const fetchActiveRides = async () => {
    const res = await fetch(apiUrl("/rides"), {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error("Could not load active rides");
    }

    const data = (await res.json()) as Ride[];
    setActiveRides([...data].sort((a, b) => b.id - a.id));
  };

  const fetchMyRides = async () => {
    const res = await fetch(apiUrl("/rides/my-rides"), {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error("Could not load your rides");
    }

    const data = (await res.json()) as Ride[];
    setMyRides([...data].sort((a, b) => b.id - a.id));
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
        await Promise.all([
          fetchDriverStatus(),
          fetchActiveRides(),
          fetchMyRides(),
        ]);
      } catch (e) {
        setError("Session expired. Please login again.");
        clearAuthSession();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [router]);

  const handleSearchRides = async () => {
    setMessage("");
    setError("");
    setSearchedRides([]);

    const parsedSourceLatitude = searchSourceLatitude
      ? Number(searchSourceLatitude)
      : NaN;
    const parsedSourceLongitude = searchSourceLongitude
      ? Number(searchSourceLongitude)
      : NaN;
    const parsedDestinationLatitude = searchDestinationLatitude
      ? Number(searchDestinationLatitude)
      : NaN;
    const parsedDestinationLongitude = searchDestinationLongitude
      ? Number(searchDestinationLongitude)
      : NaN;

    if (
      Number.isNaN(parsedSourceLatitude) ||
      Number.isNaN(parsedSourceLongitude) ||
      Number.isNaN(parsedDestinationLatitude) ||
      Number.isNaN(parsedDestinationLongitude)
    ) {
      setError(
        "Please select source and destination from suggestions to search by location.",
      );
      return;
    }

    try {
      const res = await fetch(apiUrl("/rides/search"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          source: searchSource,
          sourceLatitude: parsedSourceLatitude,
          sourceLongitude: parsedSourceLongitude,
          destination: searchDestination,
          destinationLatitude: parsedDestinationLatitude,
          destinationLongitude: parsedDestinationLongitude,
        }),
      });

      if (!res.ok) {
        setError("Failed to search rides.");
        return;
      }

      const data = (await res.json()) as SearchRideResult[];
      setSearchedRides(data);
      setMessage(data.length ? "Rides found" : "No rides found for this route");
    } catch (e) {
      setError("Unable to reach server. Try again.");
    }
  };

  const handleSubmitVerification = async () => {
    setMessage("");
    setError("");
    setSubmittingVerification(true);

    try {
      const res = await fetch(apiUrl("/users/submit-driver-details"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ vehicleNumber, vehicleModel, drivingLicense }),
      });

      if (!res.ok) {
        setError("Could not submit verification details.");
        return;
      }

      await fetchDriverStatus();
      setMessage(
        "Verification details submitted. Please wait for admin approval.",
      );
    } catch (e) {
      setError("Unable to submit verification details.");
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleBookRide = async (rideId: number, seats: number) => {
    setMessage("");
    setError("");

    if (!Number.isFinite(seats) || seats <= 0) {
      setError("Please enter valid seats to book.");
      return;
    }

    const parsedPickupLatitude = searchSourceLatitude
      ? Number(searchSourceLatitude)
      : NaN;
    const parsedPickupLongitude = searchSourceLongitude
      ? Number(searchSourceLongitude)
      : NaN;
    const parsedDropLatitude = searchDestinationLatitude
      ? Number(searchDestinationLatitude)
      : NaN;
    const parsedDropLongitude = searchDestinationLongitude
      ? Number(searchDestinationLongitude)
      : NaN;

    if (
      Number.isNaN(parsedPickupLatitude) ||
      Number.isNaN(parsedPickupLongitude) ||
      Number.isNaN(parsedDropLatitude) ||
      Number.isNaN(parsedDropLongitude)
    ) {
      setError(
        "Select source and destination from suggestions before booking.",
      );
      return;
    }

    setBookingRideId(rideId);

    try {
      const res = await fetch(apiUrl("/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          rideId,
          seats,
          pickupName: searchSource,
          pickupLatitude: parsedPickupLatitude,
          pickupLongitude: parsedPickupLongitude,
          dropName: searchDestination,
          dropLatitude: parsedDropLatitude,
          dropLongitude: parsedDropLongitude,
        }),
      });

      if (!res.ok) {
        setError("Unable to book ride. Please verify seats and ride status.");
        return;
      }

      setMessage("Ride booked successfully.");
      await Promise.all([fetchActiveRides(), fetchMyRides()]);
      await handleSearchRides();
    } catch (e) {
      setError("Unable to book ride.");
    } finally {
      setBookingRideId(null);
    }
  };

  const handleCreateRide = async () => {
    setMessage("");
    setError("");
    setCreatingRide(true);

    const parsedSeats = Number(availableSeats);
    const parsedSourceLatitude = sourceLatitude ? Number(sourceLatitude) : null;
    const parsedSourceLongitude = sourceLongitude
      ? Number(sourceLongitude)
      : null;
    const parsedDestinationLatitude = destinationLatitude
      ? Number(destinationLatitude)
      : null;
    const parsedDestinationLongitude = destinationLongitude
      ? Number(destinationLongitude)
      : null;

    if (!parsedSeats || parsedSeats <= 0) {
      setError("Please enter a valid value for available seats.");
      setCreatingRide(false);
      return;
    }

    if (
      (sourceLatitude && Number.isNaN(parsedSourceLatitude)) ||
      (sourceLongitude && Number.isNaN(parsedSourceLongitude)) ||
      (destinationLatitude && Number.isNaN(parsedDestinationLatitude)) ||
      (destinationLongitude && Number.isNaN(parsedDestinationLongitude))
    ) {
      setError("Please enter valid numeric latitude/longitude values.");
      setCreatingRide(false);
      return;
    }

    if (
      parsedSourceLatitude !== null &&
      (parsedSourceLatitude < -90 || parsedSourceLatitude > 90)
    ) {
      setError("Source latitude must be between -90 and 90.");
      setCreatingRide(false);
      return;
    }

    if (
      parsedDestinationLatitude !== null &&
      (parsedDestinationLatitude < -90 || parsedDestinationLatitude > 90)
    ) {
      setError("Destination latitude must be between -90 and 90.");
      setCreatingRide(false);
      return;
    }

    if (
      parsedSourceLongitude !== null &&
      (parsedSourceLongitude < -180 || parsedSourceLongitude > 180)
    ) {
      setError("Source longitude must be between -180 and 180.");
      setCreatingRide(false);
      return;
    }

    if (
      parsedDestinationLongitude !== null &&
      (parsedDestinationLongitude < -180 || parsedDestinationLongitude > 180)
    ) {
      setError("Destination longitude must be between -180 and 180.");
      setCreatingRide(false);
      return;
    }

    if (
      parsedSourceLatitude === null ||
      parsedSourceLongitude === null ||
      parsedDestinationLatitude === null ||
      parsedDestinationLongitude === null
    ) {
      setError(
        "Source and destination coordinates are required to create a ride.",
      );
      setCreatingRide(false);
      return;
    }

    try {
      const res = await fetch(apiUrl("/rides"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          source: rideSource,
          sourceLatitude: parsedSourceLatitude,
          sourceLongitude: parsedSourceLongitude,
          destination: rideDestination,
          destinationLatitude: parsedDestinationLatitude,
          destinationLongitude: parsedDestinationLongitude,
          departureTime,
          availableSeats: parsedSeats,
        }),
      });

      if (!res.ok) {
        setError("Failed to create ride. Please check your details.");
        return;
      }

      setMessage("Ride created successfully.");
      await Promise.all([fetchActiveRides(), fetchMyRides()]);
      setRideSource("");
      setRideDestination("");
      setSourceLatitude("");
      setSourceLongitude("");
      setDestinationLatitude("");
      setDestinationLongitude("");
      setDepartureTime("");
      setAvailableSeats("");
    } catch (e) {
      setError("Unable to create ride.");
    } finally {
      setCreatingRide(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ModeSwitch mode={mode} onModeChange={setMode} />
        {error && <p className="mb-4 text-red-400">{error}</p>}
        {message && <p className="mb-4 text-green-400">{message}</p>}

        {mode === "book" && (
          <BookRideSection
            searchSource={searchSource}
            searchDestination={searchDestination}
            searchSourceLatitude={searchSourceLatitude}
            searchSourceLongitude={searchSourceLongitude}
            searchDestinationLatitude={searchDestinationLatitude}
            searchDestinationLongitude={searchDestinationLongitude}
            searchedRides={searchedRides}
            activeRides={activeRides}
            onSearchSourceChange={setSearchSource}
            onSearchDestinationChange={setSearchDestination}
            onSearchSourceLatitudeChange={setSearchSourceLatitude}
            onSearchSourceLongitudeChange={setSearchSourceLongitude}
            onSearchDestinationLatitudeChange={setSearchDestinationLatitude}
            onSearchDestinationLongitudeChange={setSearchDestinationLongitude}
            onSearch={handleSearchRides}
            onBookRide={handleBookRide}
            bookingRideId={bookingRideId}
          />
        )}

        {mode === "make" && (
          <MakeRideSection
            driverStatus={driverStatus}
            vehicleNumber={vehicleNumber}
            vehicleModel={vehicleModel}
            drivingLicense={drivingLicense}
            submittingVerification={submittingVerification}
            rideSource={rideSource}
            rideDestination={rideDestination}
            sourceLatitude={sourceLatitude}
            sourceLongitude={sourceLongitude}
            destinationLatitude={destinationLatitude}
            destinationLongitude={destinationLongitude}
            departureTime={departureTime}
            availableSeats={availableSeats}
            myRides={myRides}
            creatingRide={creatingRide}
            onVehicleNumberChange={setVehicleNumber}
            onVehicleModelChange={setVehicleModel}
            onDrivingLicenseChange={setDrivingLicense}
            onSubmitVerification={handleSubmitVerification}
            onRideSourceChange={setRideSource}
            onRideDestinationChange={setRideDestination}
            onSourceLatitudeChange={setSourceLatitude}
            onSourceLongitudeChange={setSourceLongitude}
            onDestinationLatitudeChange={setDestinationLatitude}
            onDestinationLongitudeChange={setDestinationLongitude}
            onDepartureTimeChange={setDepartureTime}
            onAvailableSeatsChange={setAvailableSeats}
            onCreateRide={handleCreateRide}
          />
        )}
      </main>
    </div>
  );
}
