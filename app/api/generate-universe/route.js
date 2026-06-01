import { generateUniverse } from "@/lib/ai";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { goal, sessionId } = await request.json();
    if (!goal?.trim()) {
      return Response.json({ error: "Goal is required" }, { status: 400 });
    }
    const universe = await generateUniverse(goal.trim());
    const { data } = await supabaseAdmin
      .from("universes")
      .insert({
        goal: goal.trim(),
        title: universe.title,
        tagline: universe.tagline,
        total_weeks: universe.totalWeeks,
        planets: universe.planets,
        session_id: sessionId || "anonymous",
      })
      .select()
      .single();

    return Response.json({ id: data?.id, goal: goal.trim(), ...universe });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to generate universe." }, { status: 500 });
  }
}