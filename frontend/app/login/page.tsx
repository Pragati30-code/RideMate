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

const authStyles = `
  .font-display { font-family: var(--font-playfair), Georgia, serif; }
  .font-body    { font-family: var(--font-dm), sans-serif; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-up-1 { animation: fade-up 0.55s ease-out 0.05s both; }
  .fade-up-2 { animation: fade-up 0.55s ease-out 0.15s both; }
  .fade-up-3 { animation: fade-up 0.55s ease-out 0.25s both; }
  .spin      { animation: spin 0.8s linear infinite; }

  .auth-input {
    width: 100%;
    background: rgba(255,255,255,0.65);
    border: 1.5px solid rgba(45,45,45,0.1);
    border-radius: 14px;
    padding: 13px 16px;
    font-family: var(--font-dm), sans-serif;
    font-size: 15px;
    color: #1e1e1e;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    backdrop-filter: blur(8px);
    box-sizing: border-box;
  }
  .auth-input::placeholder { color: #c0b8b2; }
  .auth-input:focus {
    border-color: #ff9b6a;
    box-shadow: 0 0 0 3px rgba(255,155,106,0.12);
  }

  .auth-label {
    display: block;
    font-family: var(--font-dm), sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    color: #7a7370;
    margin-bottom: 7px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .auth-btn {
    width: 100%;
    background: #2d2d2d;
    color: #fdf6ec;
    border: none;
    border-radius: 50px;
    padding: 14px;
    font-family: var(--font-dm), sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .auth-btn:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(45,45,45,0.2);
  }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .error-box {
    background: rgba(220,80,80,0.07);
    border: 1.5px solid rgba(220,80,80,0.18);
    border-radius: 12px;
    padding: 10px 14px;
    font-family: var(--font-dm), sans-serif;
    font-size: 13px;
    color: #c0392b;
    text-align: center;
  }
  .field-error {
    font-family: var(--font-dm), sans-serif;
    font-size: 12px;
    color: #c0392b;
    margin-top: 5px;
  }
`;

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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdf6ec 0%, #fef3e8 50%, #fdf0f8 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{authStyles}</style>

      {/* Bg blobs */}
      <div style={{ position:"absolute", top:-100, right:-80, width:420, height:420, background:"radial-gradient(circle, rgba(255,180,120,0.18) 0%, transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-80, left:-60, width:340, height:340, background:"radial-gradient(circle, rgba(255,200,220,0.18) 0%, transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>

      {/* Card */}
      <div className="fade-up-1" style={{
        width: "100%", maxWidth: 420,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(28px)",
        border: "1.5px solid rgba(255,255,255,0.95)",
        borderRadius: 28,
        padding: "40px 36px",
        boxShadow: "0 20px 60px rgba(180,140,100,0.1)",
      }}>

        {/* Logo */}
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:10, textDecoration:"none", marginBottom:32 }}>
          <div style={{
            width:36, height:36, background:"#2d2d2d", borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 12px rgba(45,45,45,0.2)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13" stroke="#fdf6ec" strokeWidth="1.8" strokeLinecap="round"/>
              <rect x="3" y="13" width="18" height="5" rx="2.5" fill="#fdf6ec"/>
              <circle cx="7.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1"/>
              <circle cx="16.5" cy="18" r="1.7" fill="#2d2d2d" stroke="#fdf6ec" strokeWidth="1"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontSize:19, fontWeight:700, color:"#2d2d2d", letterSpacing:"-0.4px" }}>
            RideMate
          </span>
        </Link>

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

      {/* Bottom note */}
      <p className="font-body" style={{
        position:"absolute", bottom:20, width:"100%",
        textAlign:"center", fontSize:12, color:"rgba(45,45,45,0.28)"
      }}>
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}