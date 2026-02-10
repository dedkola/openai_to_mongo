import { NextRequest } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  // Env-based fallback for environments that still use MONGO_URI/MONGO_DB.
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    return Response.json({ logs: [] });
  }

  const mongoDb = process.env.MONGO_DB || "chat_logs";
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(mongoDb);
    const logs = await db
      .collection("logs")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return Response.json({ logs });
  } finally {
    await client.close();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { settings, search } = await req.json();
    const dbSettings = settings?.database || {};

    const mongoUri =
      dbSettings.mongoUri ||
      process.env.MONGO_URI;
    const mongoDb =
      dbSettings.mongoDb ||
      process.env.MONGO_DB ||
      "chat_logs";

    if (!mongoUri) {
      return new Response(
        JSON.stringify({
          error:
            "MongoDB is not configured. Set it in Settings (Database tab) or via MONGO_URI.",
        }),
        { status: 400 }
      );
    }

    const client = new MongoClient(mongoUri);
    try {
      await client.connect();
      const db = client.db(mongoDb);

      const filter = search && typeof search === "string" && search.trim()
        ? {
            $or: [
              { question: { $regex: search.trim(), $options: "i" } },
              { answer: { $regex: search.trim(), $options: "i" } },
            ],
          }
        : {};

      const logs = await db
        .collection("logs")
        .find(filter, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      return Response.json({ logs });
    } finally {
      await client.close();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
    });
  }
}
