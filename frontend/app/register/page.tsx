"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { apiUrl } from "@/lib/api";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage(){

  const router = useRouter();
  const [loading,setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState:{errors}
  } = useForm<RegisterData>({
    resolver:zodResolver(registerSchema)
  });

  const selectedGender = watch("gender");

  const onSubmit = async(data:RegisterData)=>{

    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/auth/register"),{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
      });

      if (!res.ok) {
        setError("Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return(
    <div className="min-h-screen bg-black flex">

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-black to-green-600/10"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl"></div>
        
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
            Join the ride
          </h1>
          <p className="text-xl text-white/60 text-center max-w-md">
            Connect with fellow students, share rides, and save money on your daily commute.
          </p>
          
          {/* Benefits */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 bg-zinc-900/60 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Save up to ₹150 per ride</p>
                <p className="text-white/50 text-sm">Split costs with fellow students</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900/60 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Verified students only</p>
                <p className="text-white/50 text-sm">Safe & trusted community</p>
              </div>
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
              Create account
            </h2>
            <p className="text-white/50 text-center mb-8">
              Start your carpooling journey today
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-white/70 text-sm mb-2">Full Name</label>
                <input
                  {...register("name")}
                  placeholder="John Doe"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-2">{errors.name.message}</p>
                )}
              </div>

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
                <label className="block text-white/70 text-sm mb-2">Phone Number</label>
                <input
                  {...register("phoneNumber")}
                  placeholder="9876543210"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                />
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm mt-2">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Student ID</label>
                <input
                  {...register("studentId")}
                  placeholder="STU001"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                />
                {errors.studentId && (
                  <p className="text-red-400 text-sm mt-2">{errors.studentId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Gender</label>
                <Select
                  value={selectedGender}
                  onValueChange={(value) => setValue("gender", value as RegisterData["gender"], { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full bg-zinc-800/50 border-white/10 text-white focus:border-green-500/50 focus:ring-green-500/50">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-400 text-sm mt-2">{errors.gender.message}</p>
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
                    Creating account...
                  </>
                ) : "Create account"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-white/30 text-sm text-center mt-6">
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}
