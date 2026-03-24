"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, getAuthHeaders, getAuthToken, clearAuthSession } from "@/lib/api";
import { ArrowLeft, LogOut } from "lucide-react";

type UserProfile = {
	id: number;
	name: string;
	email: string;
	phoneNumber?: string;
	studentId?: string;
	gender?: string;
	vehicleNumber?: string;
	vehicleModel?: string;
	drivingLicense?: string;
	verifiedDriver?: boolean;
	role?: string;
	verificationStatus?: string;
};

type DriverStatus = {
	isVerifiedDriver: boolean;
	verificationStatus: string;
	vehicleNumber: string;
	vehicleModel: string;
	drivingLicense: string;
	detailsSubmitted: boolean;
};

export default function UserProfilePage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [driverStatus, setDriverStatus] = useState<DriverStatus | null>(null);
	const [loggingOut, setLoggingOut] = useState(false);

	const handleLogout = () => {
		setLoggingOut(true);
		clearAuthSession();
		router.replace("/login");
	};

	useEffect(() => {
		const token = getAuthToken();
		if (!token) {
			router.replace("/login");
			return;
		}

		const loadProfile = async () => {
			setLoading(true);
			setError("");

			try {
				const [profileRes, statusRes] = await Promise.all([
					fetch(apiUrl("/auth/me"), {
						method: "GET",
						headers: {
							...getAuthHeaders(),
						},
					}),
					fetch(apiUrl("/users/driver-status"), {
						method: "GET",
						headers: {
							...getAuthHeaders(),
						},
					}),
				]);

				if (!profileRes.ok || !statusRes.ok) {
					throw new Error("Unable to load profile");
				}

				setProfile((await profileRes.json()) as UserProfile);
				setDriverStatus((await statusRes.json()) as DriverStatus);
			} catch (e) {
				setError("Session expired. Please login again.");
				clearAuthSession();
				router.replace("/login");
			} finally {
				setLoading(false);
			}
		};

		void loadProfile();
	}, [router]);

	if (loading) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center">
				Loading profile...
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center">
				{error || "Profile not available"}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white">
			<header className="border-b border-white/10">
				<div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
					<h1 className="text-2xl font-bold">User Profile</h1>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleLogout}
							disabled={loggingOut}
							className="px-3 py-2 md:px-4 md:py-2 rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-60"
						>
							<LogOut className="w-4 h-4" />
							<span>{loggingOut ? "Logging out..." : "Logout"}</span>
						</button>
						<Link
							href="/dashboard"
							aria-label="Back to Dashboard"
							title="Back to Dashboard"
							className="px-3 py-2 md:px-4 md:py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-2"
						>
							<ArrowLeft className="w-5 h-5 md:hidden" />
							<span className="hidden md:inline">Back to Dashboard</span>
						</Link>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-6 py-8">
				<div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
					<h2 className="text-xl font-semibold mb-5">Personal Details</h2>
					<div className="grid md:grid-cols-2 gap-4 text-sm">
						<ProfileItem label="Name" value={profile.name} />
						<ProfileItem label="Email" value={profile.email} />
						<ProfileItem label="Phone Number" value={profile.phoneNumber || "-"} />
						<ProfileItem label="Student ID" value={profile.studentId || "-"} />
						<ProfileItem label="Gender" value={profile.gender || "-"} />
						<ProfileItem label="Role" value={profile.role || "-"} />
						<ProfileItem label="Verified Driver" value={profile.verifiedDriver ? "Yes" : "No"} />
						<ProfileItem label="Verification Status" value={profile.verificationStatus || "-"} />
						<ProfileItem label="Vehicle Number" value={profile.vehicleNumber || "-"} />
						<ProfileItem label="Vehicle Model" value={profile.vehicleModel || "-"} />
						<ProfileItem label="Driving License" value={profile.drivingLicense || "-"} />
						{driverStatus && (
							<ProfileItem
								label="Details Submitted"
								value={driverStatus.detailsSubmitted ? "Yes" : "No"}
							/>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}

function ProfileItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="border border-white/10 rounded-xl p-4 bg-zinc-950/30">
			<p className="text-white/50 mb-1">{label}</p>
			<p className="font-medium break-all">{value}</p>
		</div>
	);
}
