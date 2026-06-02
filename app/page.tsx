"use client";
/* eslint-disable */
import { useState, useEffect } from "react";
import Ignition from "@/components/Ignition";
import Universe from "@/components/Universe";
import DeepDive from "@/components/DeepDive";

function getSession() {
  if (typeof window === "undefined") return "ssr";
  try {
    let s = localStorage.getItem("spark_session");
    if (!s) {
      s = Math.random().toString(36).substring(2);
      localStorage.setItem("spark_session", s);
    }
    return s;
  } catch (e) {
    return "anon";
  }
}

export default function Home() {
  const [screen, setScreen] = useState("ignition");
  const [universe, setUniverse] = useState(null as any);
  const [planet, setPlanet] = useState(null as any);
  const [sessionId, setSessionId] = useState("anon");

  useEffect(() => {
    setSessionId(getSession());
  }, []);

  function handleLaunch(d: any) {
    setUniverse(d);
    setScreen("universe");
  }

  function handleDive(p: any) {
    setPlanet(p);
    setScreen("dive");
  }

  function handleReset() {
    setUniverse(null);
    setScreen("ignition");
  }

  function handleBack() {
    setScreen("universe");
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      {screen === "ignition" && (
        <Ignition sessionId={sessionId} onLaunch={handleLaunch} />
      )}
      {screen === "universe" && universe && (
        <Universe data={universe} onDive={handleDive} onReset={handleReset} />
      )}
      {screen === "dive" && planet && universe && (
        <DeepDive planet={planet} goal={universe.goal} onBack={handleBack} />
      )}
    </main>
  );
}