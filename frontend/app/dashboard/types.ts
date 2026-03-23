export type DashboardMode = "book" | "make";

export type DriverStatus = {
  isVerifiedDriver: boolean;
  verificationStatus: string;
  vehicleNumber: string;
  drivingLicense: string;
  detailsSubmitted: boolean;
};

export type Ride = {
  id: number;
  source: string;
  sourceLatitude?: number;
  sourceLongitude?: number;
  destination: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  departureTime?: string;
  availableSeats?: number;
  distanceKm?: number;
  status?: string;
};

export type SearchRideResult = {
  ride: Ride;
  estimatedFare: number;
  segmentDistanceKm: number;
};

export const defaultDriverStatus: DriverStatus = {
  isVerifiedDriver: false,
  verificationStatus: "",
  vehicleNumber: "",
  drivingLicense: "",
  detailsSubmitted: false,
};
