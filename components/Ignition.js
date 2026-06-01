"use client";
import { useState, useEffect, useRef } from "react";
import Stars from "./Stars";

const EXAMPLES = [
  "I want to crack the UPSC exam",
  "Teach me Machine Learning from scratch",
  "I need to learn React in 2 weeks",
  "Help me understand Organic Chemistry",
  "I want to get a software engineering job",
  "Explain Quantum Physics like I'm 17",
];

export default function Ignition({ sessionId, onLaunch }) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exIdx, setExIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setExIdx(i => (i+1) % EXAMPLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  const launch = async () => {
    if (!goal.trim() || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/generate-universe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim(), sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onLaunch(data);
    } catch (e) {
      setError(e.message || "Couldn't ignite. Try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#070810",
      position:"relative", display:"flex",
      flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"24px", overflow:"hidden",
    }}>
      <Stars />
      <div style={{
        position:"absolute", top:"18%", left:"50%",
        transform:"translateX(-50%)", width:320, height:320,
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%)",
        filter:"blur(40px)", pointerEvents:"none",
      }}/>

      <div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:440, textAlign:"center" }}>
        <div style={{ marginBottom:40 }}>
          <div style={{
            fontFamily:"'Bebas Neue',cursive", fontSize:80, lineHeight:1,
            background:"linear-gradient(135deg, #f5c842 0%, #ff8c42 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            letterSpacing:"0.06em",
            filter:"drop-shadow(0 0 40px rgba(245,200,66,0.5))",
          }}>SPARK</div>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:13,
            color:"#8890b0", letterSpacing:"0.28em", marginTop:-6,
          }}>YOUR PERSONAL STUDY UNIVERSE</div>
        </div>

        <div style={{ marginBottom:24 }}>
          <div style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11,
            color:"#8890b0", marginBottom:10, letterSpacing:"0.14em",
          }}>WHAT DO YOU WANT TO LEARN?</div>
          <textarea
            ref={inputRef}
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); launch(); }}}
            placeholder={EXAMPLES[exIdx]}
            rows={2}
            style={{
              width:"100%",
              background:"rgba(255,255,255,0.04)",
              border:`1.5px solid ${goal ? "rgba(245,200,66,0.55)" : "rgba(255,255,255,0.09)"}`,
              borderRadius:16, color:"#eef0ff", resize:"none",
              fontFamily:"'DM Sans',sans-serif", fontSize:16,
              padding:"16px 20px", outline:"none", lineHeight:1.5,
              boxSizing:"border-box", transition:"border 0.3s",
            }}
          />
        </div>

        <button onClick={launch} disabled={loading || !goal.trim()} style={{
          width:"100%", padding:18,
          background: loading ? "rgba(255,255,255,0.06)"
            : "linear-gradient(135deg, #f5c842 0%, #ff8c42 100%)",
          border:"none", borderRadius:16,
          cursor: loading || !goal.trim() ? "default" : "pointer",
          fontFamily:"'Bebas Neue',cursive", fontSize:22,
          letterSpacing:"0.15em",
          color: loading ? "#8890b0" : "#0a0800",
          boxShadow: loading ? "none" : "0 8px 32px rgba(245,200,66,0.35)",
          transition:"all 0.3s",
        }}>
          {loading ? "BUILDING YOUR UNIVERSE... ◌" : "IGNITE MY PATH ✦"}
        </button>

        {error && (
          <p style={{ marginTop:12, fontFamily:"'DM Sans',sans-serif",
            fontSize:13, color:"#f54242" }}>{error}</p>
        )}

        <div style={{ marginTop:32 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
            color:"#8890b0", marginBottom:10, letterSpacing:"0.1em" }}>
            TRY ONE OF THESE →
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
            {EXAMPLES.slice(0,4).map((ex, i) => (
              <button key={i} onClick={() => { setGoal(ex); inputRef.current?.focus(); }}
                style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  borderRadius:20, padding:"6px 14px", cursor:"pointer",
                  color:"#8890b0", fontFamily:"'DM Sans',sans-serif",
                  fontSize:12, transition:"all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(245,200,66,0.6)"; e.currentTarget.style.color="#f5c842"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.09)"; e.currentTarget.style.color="#8890b0"; }}
              >{ex}</button>
            ))}
          </div>
        </div>

        <p style={{ marginTop:48, fontFamily:"'DM Sans',sans-serif",
          fontSize:12, color:"#8890b0", opacity:0.4 }}>
          No account. No signup. Just you and your path. ✦
        </p>
      </div>
    </div>
  );
}