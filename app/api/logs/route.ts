import { getDb } from "@/lib/mongo";

export async function GET() {
  const db = await getDb();
  const logs = await db
    .collection("logs")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return Response.json({ logs });
}
