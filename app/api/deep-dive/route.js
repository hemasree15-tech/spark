import { askClaude, generateQuiz } from "@/lib/ai";

export async function POST(request) {
  try {
    const { mode, planet, goal, messages } = await request.json();

    const SYSTEM = `You are SPARK, a brilliant Gen Z study companion.
The student is learning "${planet.name}" as part of their goal: "${goal}".
Be concise, smart, and genuinely helpful. Use emojis naturally. Never be boring.`;

    if (mode === "explain") {
      const result = await askClaude(SYSTEM, [{
        role: "user",
        content: `Explain "${planet.name}" clearly. Include: 1) What it is, 2) Why it matters for my goal, 3) 3 core concepts, 4) One mind-blowing fact. Max 250 words.`
      }], 700);
      return Response.json({ result });
    }

    if (mode === "roadmap") {
      const result = await askClaude(SYSTEM, [{
        role: "user",
        content: `Week-by-week roadmap for "${planet.name}" (weeks ${planet.weekStart}-${planet.weekEnd}). Each week: what to do, resource type, one milestone. Max 200 words.`
      }], 600);
      return Response.json({ result });
    }

    if (mode === "quiz") {
      const quiz = await generateQuiz(planet.name, goal);
      return Response.json({ quiz });
    }

    if (mode === "ask") {
      const result = await askClaude(SYSTEM, messages, 700);
      return Response.json({ result });
    }

    return Response.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI request failed." }, { status: 500 });
  }
}