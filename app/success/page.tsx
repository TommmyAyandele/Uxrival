"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PRO_STORAGE_KEY = "uxrival_pro";

export default function SuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Mark user as pro
    localStorage.setItem(PRO_STORAGE_KEY, "true");
  }, []);

  const handleStartCustomizing = () => {
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-d)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "500px",
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          background: "var(--accent)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px",
          fontSize: "40px",
        }}>
          ✓
        </div>
        
        <h1 style={{
          fontSize: "28px",
          fontWeight: "800",
          marginBottom: "16px",
          lineHeight: "1.2",
        }}>
          You're now on UX Rival Pro — white labelling is unlocked!
        </h1>
        
        <p style={{
          fontSize: "16px",
          color: "var(--text-muted)",
          lineHeight: "1.6",
          marginBottom: "32px",
        }}>
          Thank you for upgrading! You can now customize your reports with your agency branding.
        </p>
        
        <button
          onClick={handleStartCustomizing}
          style={{
            background: "var(--accent)",
            color: "#090909",
            border: "none",
            borderRadius: "10px",
            padding: "14px 28px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "var(--font-d)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#f2ff6a";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 20px var(--accent-glow)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Start customising your reports →
        </button>
      </div>
    </div>
  );
}
