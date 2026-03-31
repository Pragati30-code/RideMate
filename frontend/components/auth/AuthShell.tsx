import { ReactNode } from "react";
import { authStyles } from "./authStyles";

type AuthShellProps = {
  children: ReactNode;
  maxWidth: number;
  padding: string;
  bottomNote: string;
};

export default function AuthShell({ children, maxWidth, padding, bottomNote }: AuthShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdf6ec 0%, #fef3e8 50%, #fdf0f8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{authStyles}</style>

      <div
        style={{
          position: "absolute",
          top: -100,
          right: -80,
          width: 420,
          height: 420,
          background: "radial-gradient(circle, rgba(255,180,120,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -60,
          width: 340,
          height: 340,
          background: "radial-gradient(circle, rgba(255,200,220,0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        className="fade-up-1"
        style={{
          width: "100%",
          maxWidth,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(28px)",
          border: "1.5px solid rgba(255,255,255,0.95)",
          borderRadius: 28,
          padding: "40px 36px",
          boxShadow: "0 20px 60px rgba(180,140,100,0.1)",
        }}
      >
        {children}
      </div>

      <p
        className="font-body"
        style={{
          position: "absolute",
          bottom: 20,
          width: "100%",
          textAlign: "center",
          fontSize: 12,
          color: "rgba(45,45,45,0.28)",
        }}
      >
        {bottomNote}
      </p>
    </div>
  );
}
