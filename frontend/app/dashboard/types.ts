export type DashboardMode = "book" | "make";

export type DriverStatus = {
  isVerifiedDriver: boolean;
  verificationStatus: string;
  vehicleNumber: string;
  vehicleModel: string;
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
  driver?: BookingUser;
};

export type SearchRideResult = {
  ride: Ride;
  estimatedFare: number;
  segmentDistanceKm: number;
};

export type BookingUser = {
  id: number;
  name: string;
  email: string;
  rideOtp?: string;
  phoneNumber?: string;
  gender?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
};

export type DriverRideBooking = {
  id: number;
  seatsBooked: number;
  status: string;
  paymentStatus?: string;
  paymentProvider?: string;
  paymentOrderId?: string;
  paymentId?: string;
  paymentSignature?: string;
  paidAt?: string;
  pickupName?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropName?: string;
  dropLatitude?: number;
  dropLongitude?: number;
  segmentDistanceKm?: number;
  estimatedFare?: number;
  user?: BookingUser;
};

export type CurrentUserBooking = DriverRideBooking & {
  ride: Ride;
};

export const defaultDriverStatus: DriverStatus = {
  isVerifiedDriver: false,
  verificationStatus: "",
  vehicleNumber: "",
  vehicleModel: "",
  drivingLicense: "",
  detailsSubmitted: false,
};
