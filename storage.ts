import { db } from "./db";
import { botLogs, type BotLog, type InsertBotLog } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getLogs(): Promise<BotLog[]>;
  createLog(log: InsertBotLog): Promise<BotLog>;
  clearLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getLogs(): Promise<BotLog[]> {
    return await db.select().from(botLogs).orderBy(desc(botLogs.createdAt)).limit(100);
  }

  async createLog(insertLog: InsertBotLog): Promise<BotLog> {
    const [log] = await db.insert(botLogs).values(insertLog).returning();
    return log;
  }

  async clearLogs(): Promise<void> {
    await db.delete(botLogs);
  }
}

export const storage = new DatabaseStorage();
