import { DashboardMode } from "../types";

type ModeSwitchProps = {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
};

export default function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-8">
      <button
        onClick={() => onModeChange("book")}
        className={`rounded-2xl p-6 text-left border transition-colors ${
          mode === "book"
            ? "border-green-500 bg-green-500/10"
            : "border-white/10 bg-zinc-900/60 hover:border-white/30"
        }`}
      >
        <p className="text-xl font-semibold">Book a Ride</p>
        <p className="text-white/60 text-sm mt-1">Find available rides by route</p>
      </button>

      <button
        onClick={() => onModeChange("make")}
        className={`rounded-2xl p-6 text-left border transition-colors ${
          mode === "make"
            ? "border-green-500 bg-green-500/10"
            : "border-white/10 bg-zinc-900/60 hover:border-white/30"
        }`}
      >
        <p className="text-xl font-semibold">Make a Ride</p>
        <p className="text-white/60 text-sm mt-1">Offer your ride to other students</p>
      </button>
    </div>
  );
}
