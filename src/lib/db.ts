import mongoose from "mongoose";
import { HttpError } from "./errors";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = (g.__mongoose ??= { conn: null, promise: null });

export const dbConfigured = () => Boolean(process.env.MONGODB_URI);

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new HttpError(503, "The service is not available yet.", "db_not_configured");
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? "kvesty",
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    autoIndex: process.env.NODE_ENV !== "production", // build indexes via scripts/sync-indexes in prod
  });
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}
