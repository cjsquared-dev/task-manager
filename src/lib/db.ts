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

// Modify the dbConnect function
export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "eventScheduler",
      } as mongoose.ConnectOptions)
      .then(async () => {
        // Drop the database only in development mode
        if (process.env.NODE_ENV === "development") {
          console.log("Dropping database...");
          await mongoose.connection.dropDatabase(); // Use mongoose.connection here
          console.log("Database dropped successfully.");
        }

        return mongoose.connection; // Return the connection instance
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}