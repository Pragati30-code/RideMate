"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { apiUrl, setAuthSession } from "@/lib/api";
import { z } from "zod";
import Link from "next/link";

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {

  const router = useRouter();
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const {
    register,
    handleSubmit,
    formState:{errors}
  } = useForm<LoginData>({
    resolver:zodResolver(loginSchema)
  });

  const onSubmit = async (data:LoginData)=>{

    setLoading(true);
    setError("");

    try{

      const res = await fetch(apiUrl("/auth/login"),{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
      });

      if(!res.ok){
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      const rawBody = await res.text();
      let loginPayload: Record<string, unknown> = {};

      try {
        loginPayload = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {};
      } catch {
        loginPayload = {};
      }

      const extractedToken =
        (typeof loginPayload.token === "string" && loginPayload.token) ||
        (typeof loginPayload.accessToken === "string" && loginPayload.accessToken) ||
        (typeof loginPayload.jwt === "string" && loginPayload.jwt) ||
        (typeof (loginPayload.data as Record<string, unknown> | undefined)?.token === "string" &&
          ((loginPayload.data as Record<string, unknown>).token as string));

      if (!extractedToken) {
        setError("Login succeeded but token was not received. Please try again.");
        setLoading(false);
        return;
      }

      setAuthSession(extractedToken, {
        userId: loginPayload.userId,
        name: loginPayload.name,
        email: loginPayload.email,
        role: loginPayload.role,
      });

      router.push("/dashboard");

    }catch(err){
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex">

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-black to-emerald-600/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4 9l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">RideMate</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Welcome back
          </h1>
          <p className="text-xl text-white/60 text-center max-w-md">
            Your campus rides are waiting. Log in to continue your journey.
          </p>
          
          {/* Floating stats */}
          <div className="mt-12 flex gap-8">
            <div className="bg-zinc-900/60 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-2xl font-bold text-white">2,400+</p>
              <p className="text-white/50 text-sm">Active riders</p>
            </div>
            <div className="bg-zinc-900/60 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
              <p className="text-2xl font-bold text-green-400">₹50K+</p>
              <p className="text-white/50 text-sm">Saved monthly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4 9l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">RideMate</span>
            </Link>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              Log in
            </h2>
            <p className="text-white/50 text-center mb-8">
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-white/70 text-sm mb-2">College Email</label>
                <input
                  {...register("email")}
                  placeholder="you@college.edu"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <button
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3.5 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Logging in...
                  </>
                ) : "Log in"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-center">
                Don't have an account?{" "}
                <Link href="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="text-white/30 text-sm text-center mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
