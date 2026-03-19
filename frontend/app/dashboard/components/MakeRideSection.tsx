import { DriverStatus } from "../types";

type MakeRideSectionProps = {
  driverStatus: DriverStatus;
  vehicleNumber: string;
  drivingLicense: string;
  submittingVerification: boolean;
  rideSource: string;
  rideDestination: string;
  departureTime: string;
  availableSeats: number;
  ridePrice: number;
  creatingRide: boolean;
  onVehicleNumberChange: (value: string) => void;
  onDrivingLicenseChange: (value: string) => void;
  onSubmitVerification: () => void;
  onRideSourceChange: (value: string) => void;
  onRideDestinationChange: (value: string) => void;
  onDepartureTimeChange: (value: string) => void;
  onAvailableSeatsChange: (value: number) => void;
  onRidePriceChange: (value: number) => void;
  onCreateRide: () => void;
};

export default function MakeRideSection({
  driverStatus,
  vehicleNumber,
  drivingLicense,
  submittingVerification,
  rideSource,
  rideDestination,
  departureTime,
  availableSeats,
  ridePrice,
  creatingRide,
  onVehicleNumberChange,
  onDrivingLicenseChange,
  onSubmitVerification,
  onRideSourceChange,
  onRideDestinationChange,
  onDepartureTimeChange,
  onAvailableSeatsChange,
  onRidePriceChange,
  onCreateRide,
}: MakeRideSectionProps) {
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
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-white/70">Source</label>
              <input
                value={rideSource}
                onChange={(e) => onRideSourceChange(e.target.value)}
                placeholder="Source"
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-white/70">Destination</label>
              <input
                value={rideDestination}
                onChange={(e) => onRideDestinationChange(e.target.value)}
                placeholder="Destination"
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
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
                min={1}
                value={availableSeats}
                onChange={(e) => onAvailableSeatsChange(Number(e.target.value) || 1)}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-white/70">Price</label>
              <input
                type="number"
                min={1}
                value={ridePrice}
                onChange={(e) => onRidePriceChange(Number(e.target.value) || 1)}
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
        </div>
      )}
    </section>
  );
}
