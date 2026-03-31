"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validation";
import { apiUrl, setAuthSession } from "@/lib/api";
import { z } from "zod";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import AuthBrand from "@/components/auth/AuthBrand";

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) { setError("Invalid credentials"); setLoading(false); return; }

      const rawBody = await res.text();
      let loginPayload: Record<string, unknown> = {};
      try { loginPayload = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : {}; } catch { loginPayload = {}; }

      const extractedToken =
        (typeof loginPayload.token === "string" && loginPayload.token) ||
        (typeof loginPayload.accessToken === "string" && loginPayload.accessToken) ||
        (typeof loginPayload.jwt === "string" && loginPayload.jwt) ||
        (typeof (loginPayload.data as Record<string, unknown> | undefined)?.token === "string" &&
          ((loginPayload.data as Record<string, unknown>).token as string));

      if (!extractedToken) {
        setError("Login succeeded but token was not received.");
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
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <AuthShell maxWidth={420} padding="24px 16px" bottomNote="By continuing, you agree to our Terms of Service">
      <div>
        <AuthBrand />

        {/* Heading */}
        <div className="fade-up-2" style={{ marginBottom:28 }}>
          <h1 className="font-display" style={{ fontSize:30, fontWeight:800, color:"#1e1e1e", letterSpacing:"-1px", marginBottom:6, lineHeight:1.15 }}>
            Welcome back 👋
          </h1>
          <p className="font-body" style={{ fontSize:14, color:"#a09890", lineHeight:1.6 }}>
            Your campus rides are waiting for you.
          </p>
        </div>

        {/* Form */}
        <form className="fade-up-3" onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:16 }}>

          <div>
            <label className="auth-label">College Email</label>
            <input {...register("email")} className="auth-input" placeholder="you@college.edu" />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
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
                Logging in...
              </>
            ) : "Log in →"}
          </button>
        </form>

        {/* Divider + link */}
        <div style={{ marginTop:28, paddingTop:24, borderTop:"1.5px solid rgba(45,45,45,0.07)", textAlign:"center" }}>
          <p className="font-body" style={{ fontSize:14, color:"#a09890" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color:"#ff9b6a", fontWeight:600, textDecoration:"none" }}>
              Sign up ✦
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}