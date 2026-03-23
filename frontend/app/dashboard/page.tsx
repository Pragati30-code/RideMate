"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, getAuthHeaders, getAuthToken, clearAuthSession } from "@/lib/api";
import DashboardHeader from "./components/DashboardHeader";
import ModeSwitch from "./components/ModeSwitch";
import BookRideSection from "./components/BookRideSection";
import MakeRideSection from "./components/MakeRideSection";
import { DashboardMode, DriverStatus, Ride, defaultDriverStatus } from "./types";

export default function DashboardPage() {
	const router = useRouter();
	const [mode, setMode] = useState<DashboardMode>("book");
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const [driverStatus, setDriverStatus] = useState<DriverStatus>(defaultDriverStatus);

	const [searchSource, setSearchSource] = useState("");
	const [searchDestination, setSearchDestination] = useState("");
	const [searchedRides, setSearchedRides] = useState<Ride[]>([]);
	const [activeRides, setActiveRides] = useState<Ride[]>([]);

	const [vehicleNumber, setVehicleNumber] = useState("");
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
	const [ridePrice, setRidePrice] = useState("");
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
		setActiveRides(data);
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
				await fetchDriverStatus();
				await fetchActiveRides();
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

		try {
			const res = await fetch(apiUrl("/rides/search"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...getAuthHeaders(),
				},
				body: JSON.stringify({
					source: searchSource,
					destination: searchDestination,
				}),
			});

			if (!res.ok) {
				setError("Failed to search rides.");
				return;
			}

			const data = (await res.json()) as Ride[];
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
				body: JSON.stringify({ vehicleNumber, drivingLicense }),
			});

			if (!res.ok) {
				setError("Could not submit verification details.");
				return;
			}

			await fetchDriverStatus();
			setMessage("Verification details submitted. Please wait for admin approval.");
		} catch (e) {
			setError("Unable to submit verification details.");
		} finally {
			setSubmittingVerification(false);
		}
	};

	const handleCreateRide = async () => {
		setMessage("");
		setError("");
		setCreatingRide(true);

		const parsedSeats = Number(availableSeats);
		const parsedPrice = Number(ridePrice);
		const parsedSourceLatitude = sourceLatitude ? Number(sourceLatitude) : null;
		const parsedSourceLongitude = sourceLongitude ? Number(sourceLongitude) : null;
		const parsedDestinationLatitude = destinationLatitude ? Number(destinationLatitude) : null;
		const parsedDestinationLongitude = destinationLongitude ? Number(destinationLongitude) : null;

		if (!parsedSeats || !parsedPrice || parsedSeats <= 0 || parsedPrice <= 0) {
			setError("Please enter valid values for available seats and price.");
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

		if (parsedSourceLatitude !== null && (parsedSourceLatitude < -90 || parsedSourceLatitude > 90)) {
			setError("Source latitude must be between -90 and 90.");
			setCreatingRide(false);
			return;
		}

		if (parsedDestinationLatitude !== null && (parsedDestinationLatitude < -90 || parsedDestinationLatitude > 90)) {
			setError("Destination latitude must be between -90 and 90.");
			setCreatingRide(false);
			return;
		}

		if (parsedSourceLongitude !== null && (parsedSourceLongitude < -180 || parsedSourceLongitude > 180)) {
			setError("Source longitude must be between -180 and 180.");
			setCreatingRide(false);
			return;
		}

		if (parsedDestinationLongitude !== null && (parsedDestinationLongitude < -180 || parsedDestinationLongitude > 180)) {
			setError("Destination longitude must be between -180 and 180.");
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
					price: parsedPrice,
				}),
			});

			if (!res.ok) {
				setError("Failed to create ride. Please check your details.");
				return;
			}

			setMessage("Ride created successfully.");
			await fetchActiveRides();
			setRideSource("");
			setRideDestination("");
			setSourceLatitude("");
			setSourceLongitude("");
			setDestinationLatitude("");
			setDestinationLongitude("");
			setDepartureTime("");
			setAvailableSeats("");
			setRidePrice("");
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
						searchedRides={searchedRides}
						activeRides={activeRides}
						onSearchSourceChange={setSearchSource}
						onSearchDestinationChange={setSearchDestination}
						onSearch={handleSearchRides}
					/>
				)}

				{mode === "make" && (
					<MakeRideSection
						driverStatus={driverStatus}
						vehicleNumber={vehicleNumber}
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
						ridePrice={ridePrice}
						creatingRide={creatingRide}
						onVehicleNumberChange={setVehicleNumber}
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
						onRidePriceChange={setRidePrice}
						onCreateRide={handleCreateRide}
					/>
				)}
			</main>
		</div>
	);
}
