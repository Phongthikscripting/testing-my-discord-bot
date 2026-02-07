import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { startBot, getBotStatus } from "./bot";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.delete(api.logs.list.path, async (req, res) => {
    await storage.clearLogs();
    res.json({ success: true });
  });

  app.get(api.status.get.path, (req, res) => {
    const status = getBotStatus();
    res.json(status);
  });

  // Start the bot in the background
  startBot().catch(console.error);

  return httpServer;
}
