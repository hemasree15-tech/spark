import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(system, messages, maxTokens = 1000) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages,
  });
  return response.content.find((b) => b.type === "text")?.text ?? "";
}

export async function generateUniverse(goal) {
  const system = `You are SPARK's Learning Universe Engine.
Given a student's goal, return ONLY valid JSON — no markdown, no explanation.
Schema:
{
  "title": "Short universe title (4-6 words)",
  "tagline": "One punchy motivational line",
  "totalWeeks": number between 4 and 16,
  "planets": [
    {
      "id": number,
      "name": "Topic name (2-4 words)",
      "emoji": "one emoji",
      "color": "one of: spark | ice | bloom | moss | danger",
      "weekStart": number,
      "weekEnd": number,
      "why": "One sentence why learn this",
      "difficulty": 1 | 2 | 3,
      "subtopics": ["subtopic1", "subtopic2", "subtopic3"]
    }
  ]
}
Return 5 to 8 planets ordered logically.`;

  const raw = await askClaude(
    system,
    [{ role: "user", content: `Student goal: "${goal}"` }],
    900
  );

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid JSON from Claude");
  }
}

export async function generateQuiz(topic, goal) {
  const system = `You are SPARK. Return ONLY valid JSON — no markdown.
Format: [{"q":"question","opts":["a","b","c","d"],"ans":0,"exp":"short explanation"}]
Generate 4 multiple choice questions.`;

  const raw = await askClaude(
    system,
    [{ role: "user", content: `Topic: "${topic}". Goal: "${goal}". Create 4 MCQs.` }],
    700
  );

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid quiz JSON");
  }
}