import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { databaseUrl } from "./config";
const globalDb = globalThis as unknown as { bamasDb?: PrismaClient };
export function getDb() {
  if (!globalDb.bamasDb)
    globalDb.bamasDb = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl(), max: 5 }),
    });
  return globalDb.bamasDb;
}
