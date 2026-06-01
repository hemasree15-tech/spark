"use client";
import { useState } from "react";
import Stars from "./Stars";
import OrbitalMap from "./OrbitalMap";

const PLANET_COLORS = { spark:"#f5c842", ice:"#42c8f5", bloom:"#c842f5", moss:"#42f5a0", danger:"#f54242" };
const FALLBACK = ["#f5c842","#42c8f5","#c842f5","#42f5a0","#ff8c42"];
const DIFF_LABEL = { 1:"Beginner", 2:"Intermediate", 3:"Advanced" };
const DIFF_COLOR = { 1:"#42f5a0", 2:"#f5c842", 3:"#f54242" };

export default function Universe({ data, onDive, onReset }) {
  const [selected, setSelected] = useState(null);
  const [showDrawer, setDrawer] = useState(false);
  const col = selected ? (PLANET_COLORS[selected.color] || FALLBACK[0]) : "#f5c842";

  const select = (p) => { setSelected(p); setDrawer(true); };

  return (
    <div style={{ minHeight:"100vh", background:"#070810",
      position:"relative", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <Stars />

      <div style={{
        position:"relative", zIndex:5, padding:"16px 18px 10px",
        background:"rgba(7,8,16,0.75)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(255,255,255,0.09)",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <button onClick={onReset} style={{
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.09)",
          borderRadius:10, color:"#8890b0", width:36, height:36,
          cursor:"pointer", fontSize:16,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{
            fontFamily:"'Bebas Neue',cursive", fontSize:20,
            letterSpacing:"0.1em",
            background:"linear-gradient(90deg,#f5c842,#ff8c42)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>{data.title}</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif",
            fontSize:11, color:"#8890b0", marginTop:1 }}>{data.tagline}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive",
            fontSize:20, color:"#f5c842" }}>{data.totalWeeks}w</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif",
            fontSize:10, color:"#8890b0" }}>roadmap</div>
        </div>
      </div>

      <div style={{ position:"relative", zIndex:2,
        display:"flex", justifyContent:"center", padding:"16px 0 0" }}>
        <OrbitalMap planets={data.planets} onSelect={select} selected={selected}/>
      </div>

      {!selected && (
        <div style={{ position:"relative", zIndex:2, textAlign:"center",
          marginTop:-4, fontFamily:"'DM Sans',sans-serif",
          fontSize:12, color:"#8890b0", letterSpacing:"0.12em" }}>
          TAP A PLANET TO EXPLORE
        </div>
      )}

      {!showDrawer && (
        <div style={{ position:"relative", zIndex:2, overflowX:"auto",
          padding:"12px 16px 28px", display:"flex", gap:8 }}>
          {data.planets.map((p, i) => {
            const c = PLANET_COLORS[p.color] || FALLBACK[i % FALLBACK.length];
            return (
              <button key={p.id} onClick={() => select(p)} style={{
                flexShrink:0, background:"rgba(255,255,255,0.04)",
                border:`1px solid ${c}44`, borderRadius:12,
                padding:"10px 14px", cursor:"pointer", textAlign:"center", minWidth:80,
              }}>
                <div style={{ fontSize:20 }}>{p.emoji}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",
                  fontSize:10, color:c, marginTop:4, fontWeight:700 }}>
                  {p.name.length > 9 ? p.name.slice(0,8)+"…" : p.name}
                </div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",
                  fontSize:9, color:"#8890b0", marginTop:1 }}>
                  W{p.weekStart}–{p.weekEnd}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showDrawer && selected && (
        <div style={{
          position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:"100%", maxWidth:480, zIndex:50,
          background:"rgba(12,14,26,0.97)", backdropFilter:"blur(24px)",
          borderTop:`2px solid ${col}55`, borderRadius:"24px 24px 0 0",
          padding:"20px 20px 36px",
          animation:"slideUp 0.35s cubic-bezier(.2,1,.4,1) both",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"flex-start", marginBottom:14 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:36 }}>{selected.emoji}</span>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',cursive",
                  fontSize:22, letterSpacing:"0.06em", color:col }}>
                  {selected.name}
                </div>
                <div style={{ display:"flex", gap:6, marginTop:3 }}>
                  <span style={{
                    background:(DIFF_COLOR[selected.difficulty]||"#f5c842")+"22",
                    color:DIFF_COLOR[selected.difficulty]||"#f5c842",
                    border:`1px solid ${(DIFF_COLOR[selected.difficulty]||"#f5c842")}55`,
                    borderRadius:6, fontSize:10, padding:"2px 8px", fontWeight:700,
                    fontFamily:"'DM Sans',sans-serif",
                  }}>{DIFF_LABEL[selected.difficulty]}</span>
                  <span style={{
                    background:"rgba(255,255,255,0.04)",
                    color:"#8890b0",
                    border:"1px solid rgba(255,255,255,0.09)",
                    borderRadius:6, fontSize:10, padding:"2px 8px",
                    fontFamily:"'DM Sans',sans-serif",
                  }}>Week {selected.weekStart}–{selected.weekEnd}</span>
                </div>
              </div>
            </div>
            <button onClick={() => { setDrawer(false); setSelected(null); }} style={{
              background:"rgba(255,255,255,0.04)", border:"none",
              borderRadius:8, color:"#8890b0", width:30, height:30,
              cursor:"pointer", fontSize:16,
            }}>✕</button>
          </div>

          <div style={{
            background:col+"14", border:`1px solid ${col}33`,
            borderRadius:12, padding:"12px 14px", marginBottom:14,
          }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
              color:"#8890b0", marginBottom:4, letterSpacing:"0.1em" }}>
              WHY THIS MATTERS
            </div>
            <div style={{ fontFamily:"'DM Sans',sans-serif",
              fontSize:14, color:"#eef0ff", lineHeight:1.5 }}>
              {selected.why}
            </div>
          </div>

          <div style={{ marginBottom:18 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
              color:"#8890b0", marginBottom:8, letterSpacing:"0.1em" }}>
              WHAT YOU'LL LEARN
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {selected.subtopics?.map((s, i) => (
                <span key={i} style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.09)",
                  borderRadius:20, padding:"5px 12px",
                  fontFamily:"'DM Sans',sans-serif",
                  fontSize:12, color:"#eef0ff",
                }}>{s}</span>
              ))}
            </div>
          </div>

          <button onClick={() => onDive(selected)} style={{
            width:"100%", padding:16,
            background:`linear-gradient(135deg, ${col}, #ff8c42)`,
            border:"none", borderRadius:14, cursor:"pointer",
            fontFamily:"'Bebas Neue',cursive", fontSize:20,
            letterSpacing:"0.12em", color:"#0a0800",
            boxShadow:`0 8px 28px ${col}44`,
          }}>
            DIVE INTO {selected.name.toUpperCase()} ✦
          </button>
        </div>
      )}
    </div>
  );
}