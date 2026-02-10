import { NextRequest } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { mongoUri, mongoDb } = await req.json();

    if (!mongoUri || typeof mongoUri !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Missing or invalid mongoUri" }), {
        status: 400,
      });
    }

    const client = new MongoClient(mongoUri);

    try {
      await client.connect();
      const db = client.db(
        typeof mongoDb === "string" && mongoDb.trim().length > 0 ? mongoDb : undefined
      );
      await db.command({ ping: 1 });

      return Response.json({ ok: true });
    } finally {
      await client.close();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
    });
  }
}

