"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { z } from "zod";
import { useState } from "react";

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage(){

  const router = useRouter();
  const [loading,setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState:{errors}
  } = useForm<RegisterData>({
    resolver:zodResolver(registerSchema)
  });

  const onSubmit = async(data:RegisterData)=>{

    setLoading(true);

    await fetch("/api/auth/register",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(data)
    });

    setLoading(false);
    router.push("/role-selection");
  }

  return(

    <div className="min-h-screen flex">

      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-col justify-center items-center p-12">
        <h1 className="text-4xl font-bold mb-4">RideMate 🚗</h1>
        <p className="text-center text-lg max-w-md">
          Join your college ride network.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50">

        <div className="w-[420px] bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <input
              {...register("name")}
              placeholder="Full Name"
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-gray-700"
            />
            <p className="text-red-500 text-sm">{errors.name?.message}</p>

            <input
              {...register("email")}
              placeholder="College Email"
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-gray-700"
            />
            <p className="text-red-500 text-sm">{errors.email?.message}</p>

            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-gray-700"
            />
            <p className="text-red-500 text-sm">{errors.password?.message}</p>

            <button
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-2 rounded-lg"
            >
              {loading ? "Creating..." : "Register"}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}
