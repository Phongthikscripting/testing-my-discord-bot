import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage.ts";
import { startBot, getBotStatus } from "./bot.ts";

/**
 * Temporary API paths (because @shared/routes breaks on Render)
 */
const api = {
  logs: {
    list: { path: "/api/logs" },
  },
  status: {
    get: { path: "/api/status" },
  },
};

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.get(api.logs.list.path, async (_req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(api.logs.list.path, async (_req, res) => {
    await storage.clearLogs();
    res.json({ success: true });
  });

  app.get(api.status.get.path, (_req, res) => {
    const status = getBotStatus();
    res.json(status);
  });

  // Start the bot in background
  startBot().catch(console.error);

  return httpServer;
}
