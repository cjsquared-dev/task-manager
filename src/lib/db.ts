"use server";

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface Cached {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  }

  const globalWithMongoose = global as typeof global & { mongoose: Cached };

const cached: Cached = globalWithMongoose.mongoose || { conn: null, promise: null };

export async function dbConnect() {
    if (cached.conn) return cached.conn;
  
    if (!cached.promise) {
      cached.promise = (mongoose
        .connect(MONGODB_URI, {
          dbName: "eventScheduler",
        } as mongoose.ConnectOptions) as unknown as Promise<mongoose.Connection>)
        .then((connection) => {
          // Force-load all models

          return connection;
        });
    }
  
    cached.conn = await cached.promise;
    return cached.conn;
  }