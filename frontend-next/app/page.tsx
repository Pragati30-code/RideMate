import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">

      <h1 className="text-3xl font-bold">
        Smart College Ride System 🚗
      </h1>

      <Link href="/login">
        <button className=" text-white px-4 py-2 rounded">
          Login
        </button>
      </Link>

      <Link href="/register">
        <button className="bg-gray-800 text-white px-4 py-2 rounded">
          Register
        </button>
      </Link>

    </div>
  );
}
