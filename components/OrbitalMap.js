"use client";
import { useEffect, useState } from "react";

const PLANET_COLORS = {
  spark:"#f5c842", ice:"#42c8f5",
  bloom:"#c842f5", moss:"#42f5a0", danger:"#f54242"
};
const FALLBACK = ["#f5c842","#42c8f5","#c842f5","#42f5a0","#ff8c42"];

export default function OrbitalMap({ planets, onSelect, selected }) {
  const [tick, setTick] = useState(0);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 60);
    return () => clearInterval(t);
  }, []);

  const W = 340, H = 340, CX = W/2, CY = H/2;
  const minR = 44, gap = 36;

  return (
    <svg viewBox={`0 0 ${W} ${H}`}
      style={{ width:"100%", maxWidth:340, display:"block", overflow:"visible" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="sun">
          <stop offset="0%" stopColor="#f5c842" stopOpacity="1"/>
          <stop offset="100%" stopColor="#ff8c42" stopOpacity="0.7"/>
        </radialGradient>
      </defs>

      {planets.map((_, i) => (
        <circle key={i} cx={CX} cy={CY} r={minR + i * gap}
          fill="none" stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.6" strokeDasharray="3 6"/>
      ))}

      <circle cx={CX} cy={CY} r={18} fill="url(#sun)" filter="url(#glow)"/>
      <circle cx={CX} cy={CY} r={22} fill="none" stroke="#f5c842"
        strokeWidth="0.8" strokeOpacity="0.4"/>
      <text x={CX} y={CY+1} textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fill="#0a0800"
        fontFamily="Bebas Neue, cursive">YOU</text>

      {planets.map((p, i) => {
        const r = minR + i * gap;
        const base = (i * 137.5 * Math.PI) / 180;
        const speed = 0.0008 / (i + 1);
        const angle = base + tick * speed;
        const px = CX + r * Math.cos(angle);
        const py = CY + r * Math.sin(angle);
        const col = PLANET_COLORS[p.color] || FALLBACK[i % FALLBACK.length];
        const isHov = hovered === p.id;
        const isSel = selected?.id === p.id;
        const pr = 10 + p.difficulty * 2;

        return (
          <g key={p.id}
            onClick={() => onSelect(p)}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor:"pointer" }}>
            <circle cx={px} cy={py} r={pr+8} fill={col}
              fillOpacity={isHov||isSel ? 0.18 : 0.06}/>
            {isSel && <circle cx={px} cy={py} r={pr+14}
              fill="none" stroke={col} strokeWidth="1"
              strokeOpacity="0.6" strokeDasharray="4 4"/>}
            <circle cx={px} cy={py} r={pr} fill={col}
              fillOpacity={isHov ? 1 : 0.88} filter="url(#glow)"/>
            <text x={px} y={py+1} textAnchor="middle"
              dominantBaseline="middle" fontSize={pr}>
              {p.emoji}
            </text>
            <text x={px} y={py+pr+8} textAnchor="middle"
              fontSize="6.5" fontFamily="DM Sans, sans-serif"
              fontWeight="700"
              fill={isHov||isSel ? col : "rgba(238,240,255,0.65)"}>
              {p.name.length > 12 ? p.name.slice(0,11)+"…" : p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}