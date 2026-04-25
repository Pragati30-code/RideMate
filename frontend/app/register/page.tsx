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
import AuthShell from "@/components/auth/AuthShell";
import AuthBrand from "@/components/auth/AuthBrand";

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const selectedGender = watch("gender");

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { setError("Registration failed. Please try again."); setLoading(false); return; }
      router.push("/login");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <AuthShell maxWidth={460} padding="40px 16px" bottomNote="By signing up, you agree to our Terms of Service">
      <div>
        <AuthBrand />

        {/* Heading */}
        <div className="fade-up-2" style={{ marginBottom:28 }}>
          <h1 className="font-display" style={{ fontSize:30, fontWeight:800, color:"#1e1e1e", letterSpacing:"-1px", marginBottom:6, lineHeight:1.15 }}>
            Join the ride 🌸
          </h1>
          <p className="font-body" style={{ fontSize:14, color:"#a09890", lineHeight:1.6 }}>
            Connect with students, share costs, stress less.
          </p>
        </div>

        {/* Form */}
        <form className="fade-up-3" onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Name + Email side by side on wider screens */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label className="auth-label">Full Name</label>
              <input {...register("name")} className="auth-input" placeholder="Pragati Panwar" />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="auth-label">Student ID</label>
              <input {...register("studentId")} className="auth-input" placeholder="12345678901" inputMode="numeric" maxLength={11} />
              {errors.studentId && <p className="field-error">{errors.studentId.message}</p>}
            </div>
          </div>

          <div>
            <label className="auth-label">College Email</label>
            <input {...register("email")} className="auth-input" placeholder="you@college.edu" />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label className="auth-label">Phone Number</label>
              <input {...register("phoneNumber")} className="auth-input" placeholder="+91" />
              {errors.phoneNumber && <p className="field-error">{errors.phoneNumber.message}</p>}
            </div>
            <div>
              <label className="auth-label">Gender</label>
              <Select
                value={selectedGender}
                onValueChange={(value) => setValue("gender", value as RegisterData["gender"], { shouldValidate: true })}
              >
                <SelectTrigger className="w-full auth-input" style={{ height:"auto" }}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="field-error">{errors.gender.message}</p>}
            </div>
          </div>

          <div>
            <label className="auth-label">Password</label>
            <input type="password" {...register("password")} className="auth-input" placeholder="••••••••" />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop:4 }}>
            {loading ? (
              <>
                <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Creating account...
              </>
            ) : "Create account →"}
          </button>
        </form>

        {/* Divider + link */}
        <div style={{ marginTop:24, paddingTop:20, borderTop:"1.5px solid rgba(45,45,45,0.07)", textAlign:"center" }}>
          <p className="font-body" style={{ fontSize:14, color:"#a09890" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color:"#ff9b6a", fontWeight:600, textDecoration:"none" }}>
              Log in ✦
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}