"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";

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

      const res = await fetch("/api/auth/login",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
      });

      if(!res.ok){
        setError("Invalid credentials");
        return;
      }

      router.push("/role-selection");

    }catch(err){
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-col justify-center items-center p-12">
        <h1 className="text-4xl font-bold mb-4">RideMate 🚗</h1>
        <p className="text-lg text-center max-w-md">
          Smart ride booking for college students.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50">

        <div className="w-[420px] bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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

            {error && (
              <p className="text-red-500 text-sm text-center">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-2 rounded-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
