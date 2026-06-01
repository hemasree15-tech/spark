"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const PLANET_COLORS = { spark:"#f5c842", ice:"#42c8f5", bloom:"#c842f5", moss:"#42f5a0", danger:"#f54242" };
const TABS = [
  { id:"explain", emoji:"💡", label:"Explain" },
  { id:"roadmap", emoji:"🗺", label:"Roadmap" },
  { id:"quiz",    emoji:"⚡", label:"Quiz" },
  { id:"ask",     emoji:"🤖", label:"Ask AI" },
];

export default function DeepDive({ planet, goal, onBack }) {
  const col = PLANET_COLORS[planet.color] || "#f5c842";
  const [mode, setMode] = useState("explain");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({});
  const [quiz, setQuiz] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [askInput, setAskInput] = useState("");
  const [askLoad, setAskLoad] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const callAPI = useCallback(async (body) => {
    const res = await fetch("/api/deep-dive", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ...body, planet, goal }),
    });
    return res.json();
  }, [planet, goal]);

  const loadContent = useCallback(async (m) => {
    if (cache[m]) { setContent(cache[m]); return; }
    setLoading(true); setContent("");
    const data = await callAPI({ mode: m });
    const text = data.result || data.error || "Try again.";
    setContent(text);
    setCache(c => ({ ...c, [m]: text }));
    setLoading(false);
  }, [cache, callAPI]);

  const loadQuiz = useCallback(async () => {
    if (cache.quiz) { setQuiz(cache.quiz); return; }
    setLoading(true);
    const data = await callAPI({ mode:"quiz" });
    setQuiz(data.quiz || null);
    if (data.quiz) setCache(c => ({ ...c, quiz: data.quiz }));
    setLoading(false);
  }, [cache, callAPI]);

  useEffect(() => {
    if (mode === "explain" || mode === "roadmap") loadContent(mode);
    if (mode === "quiz") { setQIdx(0); setPicked(null); setScore(0); setQuizDone(false); loadQuiz(); }
    if (mode === "ask" && msgs.length === 0) {
      setMsgs([{ role:"ai", text:`Hey! I'm your SPARK guide for ${planet.name} 🚀 Ask me anything!` }]);
    }
  }, [mode]);

  const sendAsk = async () => {
    const txt = askInput.trim();
    if (!txt || askLoad) return;
    const newMsgs = [...msgs, { role:"user", text:txt }];
    setMsgs(newMsgs); setAskInput(""); setAskLoad(true);
    const history = newMsgs.map(m => ({ role: m.role==="ai" ? "assistant" : "user", content: m.text }));
    const data = await callAPI({ mode:"ask", messages: history });
    setMsgs(m => [...m, { role:"ai", text: data.result || "Try again!" }]);
    setAskLoad(false);
  };

  const pickAns = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === quiz[qIdx].ans) setScore(s => s + 1);
  };

  const nextQ = () => {
    if (qIdx + 1 >= quiz.length) { setQuizDone(true); return; }
    setQIdx(q => q + 1); setPicked(null);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0c0e1a",
      display:"flex", flexDirection:"column" }}>

      <div style={{
        padding:"16px 18px 12px", background:col+"14",
        borderBottom:`2px solid ${col}44`,
        position:"sticky", top:0, zIndex:30,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={onBack} style={{
            background:"rgba(255,255,255,0.04)",
            border:`1px solid ${col}44`, borderRadius:10,
            color:col, width:36, height:36, cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>←</button>
          <span style={{ fontSize:28 }}>{planet.emoji}</span>
          <div>
            <div style={{ fontFamily:"'Bebas Neue',cursive",
              fontSize:22, letterSpacing:"0.06em", color:col }}>
              {planet.name}
            </div>
            <div style={{ fontFamily:"'DM Sans',sans-serif",
              fontSize:11, color:"#8890b0" }}>
              Week {planet.weekStart}–{planet.weekEnd} · {["","Beginner","Intermediate","Advanced"][planet.difficulty]}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:6, marginTop:14 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setMode(t.id)} style={{
              flex:1, padding:"8px 4px", borderRadius:10, cursor:"pointer",
              border:`1px solid ${mode===t.id ? col : "rgba(255,255,255,0.09)"}`,
              background: mode===t.id ? col+"22" : "rgba(255,255,255,0.04)",
              color: mode===t.id ? col : "#8890b0",
              fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            }}>
              <span style={{ fontSize:14 }}>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"18px 18px 32px" }}>

        {(mode==="explain"||mode==="roadmap") && (
          loading
            ? <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:20 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    height: i===1?18:13, width:`${55+i*8}%`,
                    background:"rgba(255,255,255,0.06)", borderRadius:6,
                    animation:"shimmer 1.4s infinite",
                  }}/>
                ))}
              </div>
            : <div style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:14,
                color:"#eef0ff", lineHeight:1.75, whiteSpace:"pre-wrap",
              }}>{content}</div>
        )}

        {mode==="quiz" && (
          loading
            ? <div style={{ textAlign:"center", padding:"40px 0",
                color:"#8890b0", fontFamily:"'DM Sans',sans-serif" }}>
                Generating quiz… ⚡
              </div>
            : quizDone
              ? <div style={{ textAlign:"center", padding:"30px 0" }}>
                  <div style={{ fontSize:56 }}>{score>=3?"🏆":score>=2?"⚡":"💀"}</div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive",
                    fontSize:36, color:col, marginTop:8 }}>
                    {score}/{quiz.length} CORRECT
                  </div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",
                    fontSize:14, color:"#8890b0", marginTop:6, marginBottom:28 }}>
                    {score===quiz.length ? "Perfect! You're built different 🔥"
                      : score>=2 ? "Solid! Keep grinding."
                      : "Go review and retry — you got this."}
                  </div>
                  <button onClick={() => { setQIdx(0); setPicked(null); setScore(0); setQuizDone(false); }}
                    style={{
                      background:`linear-gradient(135deg, ${col}, #ff8c42)`,
                      color:"#0a0800", border:"none", borderRadius:14,
                      padding:"14px 32px", cursor:"pointer",
                      fontFamily:"'Bebas Neue',cursive", fontSize:18,
                    }}>RETRY ↺</button>
                </div>
              : quiz
                ? <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",
                        fontSize:12, color:"#8890b0" }}>Q{qIdx+1} of {quiz.length}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",
                        fontSize:12, color:col }}>{score} correct</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.06)",
                      borderRadius:4, height:4, marginBottom:20 }}>
                      <div style={{ width:`${(qIdx/quiz.length)*100}%`,
                        height:"100%", background:col, borderRadius:4, transition:"width 0.4s" }}/>
                    </div>
                    <div style={{ background:col+"14", border:`1px solid ${col}44`,
                      borderRadius:14, padding:18, marginBottom:16 }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif",
                        fontSize:16, color:"#eef0ff", lineHeight:1.5, fontWeight:600 }}>
                        {quiz[qIdx].q}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {quiz[qIdx].opts.map((opt, i) => {
                        let bg="rgba(255,255,255,0.04)", border="rgba(255,255,255,0.09)", tc="#eef0ff";
                        if (picked!==null) {
                          if (i===quiz[qIdx].ans) { bg="#42f5a022"; border="#42f5a0"; tc="#42f5a0"; }
                          else if (i===picked) { bg="#f5424222"; border="#f54242"; tc="#f54242"; }
                        }
                        return (
                          <button key={i} onClick={() => pickAns(i)} style={{
                            background:bg, border:`1.5px solid ${border}`,
                            borderRadius:12, padding:"14px 16px",
                            cursor:picked!==null?"default":"pointer",
                            textAlign:"left", color:tc,
                            fontFamily:"'DM Sans',sans-serif", fontSize:14,
                            transition:"all 0.25s",
                            display:"flex", justifyContent:"space-between",
                          }}>
                            <span>{opt}</span>
                            {picked!==null && i===quiz[qIdx].ans && <span>✓</span>}
                            {picked!==null && i===picked && i!==quiz[qIdx].ans && <span>✗</span>}
                          </button>
                        );
                      })}
                    </div>
                    {picked!==null && (
                      <div style={{ marginTop:14 }}>
                        <div style={{ background:"rgba(255,255,255,0.04)",
                          border:"1px solid rgba(255,255,255,0.09)",
                          borderRadius:10, padding:"12px 14px",
                          fontFamily:"'DM Sans',sans-serif", fontSize:13,
                          color:"#8890b0", marginBottom:12, lineHeight:1.5 }}>
                          💡 {quiz[qIdx].exp}
                        </div>
                        <button onClick={nextQ} style={{
                          width:"100%", padding:14,
                          background:`linear-gradient(135deg, ${col}, #ff8c42)`,
                          color:"#0a0800", border:"none", borderRadius:12,
                          cursor:"pointer", fontFamily:"'Bebas Neue',cursive",
                          fontSize:18, letterSpacing:"0.1em",
                        }}>{qIdx+1>=quiz.length ? "SEE RESULTS 🏆" : "NEXT →"}</button>
                      </div>
                    )}
                  </div>
                : <div style={{ textAlign:"center", color:"#f54242",
                    padding:"40px 0", fontFamily:"'DM Sans',sans-serif" }}>
                    Couldn't load quiz. Try again.
                  </div>
        )}

        {mode==="ask" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {msgs.map((m,i) => (
              <div key={i} style={{
                alignSelf: m.role==="user" ? "flex-end" : "flex-start",
                maxWidth:"90%",
                background: m.role==="user" ? col+"22" : "rgba(255,255,255,0.04)",
                border:`1px solid ${m.role==="user" ? col+"55" : "rgba(255,255,255,0.09)"}`,
                borderRadius: m.role==="user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                padding:"11px 15px", color:"#eef0ff", fontSize:13,
                fontFamily:"'DM Sans',sans-serif", lineHeight:1.65, whiteSpace:"pre-wrap",
              }}>{m.text}</div>
            ))}
            {askLoad && (
              <div style={{ alignSelf:"flex-start", display:"flex", gap:5,
                padding:"12px 16px", background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.09)",
                borderRadius:"16px 16px 16px 2px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:"50%",
                    background:col, animation:`nb 1s ${i*0.15}s infinite` }}/>
                ))}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      {mode==="ask" && (
        <div style={{ padding:"12px 16px 28px",
          borderTop:"1px solid rgba(255,255,255,0.09)",
          background:"rgba(12,14,26,0.95)", display:"flex", gap:8 }}>
          <input value={askInput} onChange={e => setAskInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && sendAsk()}
            placeholder={`Ask anything about ${planet.name}…`}
            style={{
              flex:1, background:"rgba(255,255,255,0.04)",
              border:`1px solid ${col}44`, borderRadius:12,
              color:"#eef0ff", fontFamily:"'DM Sans',sans-serif",
              fontSize:14, padding:"12px 16px", outline:"none",
            }}/>
          <button onClick={sendAsk} disabled={askLoad} style={{
            background:col, color:"#0a0800", border:"none",
            borderRadius:12, padding:"12px 18px", cursor:"pointer",
            fontFamily:"'Bebas Neue',cursive", fontSize:18,
          }}>→</button>
        </div>
      )}
    </div>
  );
}