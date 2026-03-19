import { Ride } from "../types";

type BookRideSectionProps = {
  searchSource: string;
  searchDestination: string;
  rides: Ride[];
  onSearchSourceChange: (value: string) => void;
  onSearchDestinationChange: (value: string) => void;
  onSearch: () => void;
};

export default function BookRideSection({
  searchSource,
  searchDestination,
  rides,
  onSearchSourceChange,
  onSearchDestinationChange,
  onSearch,
}: BookRideSectionProps) {
  return (
    <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">Search Rides</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <input
          value={searchSource}
          onChange={(e) => onSearchSourceChange(e.target.value)}
          placeholder="Source"
          className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
        />
        <input
          value={searchDestination}
          onChange={(e) => onSearchDestinationChange(e.target.value)}
          placeholder="Destination"
          className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3"
        />
      </div>
      <button onClick={onSearch} className="bg-white text-black font-semibold px-5 py-3 rounded-full">
        Search
      </button>

      <div className="space-y-3 pt-2">
        {rides.map((ride) => (
          <div key={ride.id} className="border border-white/10 rounded-xl p-4 bg-zinc-950/40">
            <p className="font-semibold">
              {ride.source} to {ride.destination}
            </p>
            <p className="text-sm text-white/60">
              Seats: {ride.availableSeats ?? "-"} | Price: Rs {ride.price ?? "-"}
            </p>
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
