"use client";

import { useState } from "react";

export default function Home() {
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/add?a=${a}&b=${b}`
      );
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error connecting to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <h1 className="text-3xl font-bold">Backend Add Test</h1>

      <div className="flex items-center gap-4">
        <input
          type="number"
          value={a}
          onChange={(e) => setA(Number(e.target.value))}
          className="w-24 rounded border px-3 py-2 text-center text-lg"
          placeholder="A"
        />
        <span className="text-2xl font-bold">+</span>
        <input
          type="number"
          value={b}
          onChange={(e) => setB(Number(e.target.value))}
          className="w-24 rounded border px-3 py-2 text-center text-lg"
          placeholder="B"
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={loading}
        className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Calculating..." : "Add"}
      </button>

      {result !== null && (
        <p className="text-2xl font-bold">
          Result: <span className="text-blue-600">{result}</span>
        </p>
      )}
    </main>
  );
}