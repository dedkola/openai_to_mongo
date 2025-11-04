import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getDb } from "@/lib/mongo";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'message'" }), {
        status: 400,
      });
    }

    // 1) Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
    });

    const answer = completion.choices[0]?.message?.content ?? "";

    // 2) Store in Mongo
    const db = await getDb();
    const doc = {
      sessionId: sessionId || null,
      question: message,
      answer,
      model: "gpt-3.5-turbo",
      createdAt: new Date(),
    };
    await db.collection("logs").insertOne(doc);

    return Response.json({ answer });
  } catch (err: unknown) {
    console.error("/api/chat error", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
