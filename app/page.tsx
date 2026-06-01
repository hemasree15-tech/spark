"use client";
import { useState, useEffect } from "react";
import Ignition from "@/components/Ignition";
import Universe from "@/components/Universe";
import DeepDive from "@/components/DeepDive";

function getSession() {
  if (typeof window === "undefined") return "ssr";
  let s = localStorage.getItem("spark_session");
  if (!s) { s = crypto.randomUUID(); localStorage.setItem("spark_session", s); }
  return s;
}

export default function Home() {
  const [screen, setScreen] = useState("ignition");
  const [universe, setUniverse] = useState(null);
  const [planet, setPlanet] = useState(null);
  const [sessionId, setSessionId] = useState("anon");

  useEffect(() => { setSessionId(getSession()); }, []);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      {screen === "ignition" && (
        <Ignition sessionId={sessionId} onLaunch={d => { setUniverse(d); setScreen("universe"); }} />
      )}
      {screen === "universe" && universe && (
        <Universe data={universe} onDive={p => { setPlanet(p); setScreen("dive"); }} onReset={() => { setUniverse(null); setScreen("ignition"); }} />
      )}
      {screen === "dive" && planet && universe && (
        <DeepDive planet={planet} goal={universe.goal} onBack={() => setScreen("universe")} />
      )}
    </main>
  );
}