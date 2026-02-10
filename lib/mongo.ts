import { MongoClient, Db } from "mongodb";

// Optional env-based configuration. If these are not set, the helper
// will throw when called, but importing this module won't crash.
const uriFromEnv = process.env.MONGO_URI as string | undefined;
const dbNameFromEnv = (process.env.MONGO_DB as string | undefined) || "chat_logs";

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uriFromEnv) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uriFromEnv);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uriFromEnv);
    clientPromise = client.connect();
  }
}

export async function getDb(): Promise<Db> {
  if (!uriFromEnv || !clientPromise) {
    throw new Error(
      "MONGO_URI is not configured. Set it as an environment variable or use per-request Mongo settings where supported."
    );
  }

  const c = await clientPromise;
  return c.db(dbNameFromEnv);
}
