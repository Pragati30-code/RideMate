import Link from "next/link";
import { UserCircle2 } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">RideMate Dashboard</h1>
        <div className="flex flex-row gap-2">
          <Link
            href="/my-ride-dashboard"
            className="inline-flex px-4 py-2 rounded-full border border-sky-400/40 text-sky-300 hover:bg-sky-500/10 transition-colors"
          >
            Open My Ride Dashboard
          </Link>
        <Link
          href="/user-profile"
          aria-label="Open profile"
          title="Profile"
          className="w-11 h-11 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <UserCircle2 className="w-6 h-6 text-white" />
        </Link>
      </div>
      </div>
    </header>
  );
}
