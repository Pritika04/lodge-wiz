import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
	throw new Error("DATABASE_URL_UNPOOLED is not set");
}

console.log("Connecting to:", connectionString.split(":")[2].split("@")[1]);

const client = postgres(connectionString, {
	max: 1,
	ssl: { rejectUnauthorized: false },
});

export const db = drizzle(client, { schema });