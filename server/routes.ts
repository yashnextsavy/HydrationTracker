import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { addWaterSchema, updateGoalSchema, updateReminderSettingsSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints for the hydration reminder app
  
  // Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      // For simplicity, use userId 1 (test user)
      const userId = 1;
      const settings = await storage.getSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(settings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // Update user settings
  app.patch("/api/settings", async (req, res) => {
    try {
      // For simplicity, use userId 1 and settingsId 1
      const userId = 1;
      const settingsId = 1;
      
      const result = updateGoalSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedSettings = await storage.updateSettings(settingsId, result.data);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (err) {
      console.error("Error updating settings:", err);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  
  // Get water intake for today
  app.get("/api/water-intake", async (req, res) => {
    try {
      // For simplicity, use userId 1
      const userId = 1;
      const today = new Date().toISOString().split('T')[0];
      
      const intakes = await storage.getWaterIntake(userId, today);
      
      // Calculate total intake
      const totalIntake = intakes.reduce((sum, intake) => sum + intake.amount, 0);
      
      res.json({ intakes, totalIntake });
    } catch (err) {
      console.error("Error fetching water intake:", err);
      res.status(500).json({ message: "Failed to fetch water intake" });
    }
  });
  
  // Add water intake
  app.post("/api/water-intake", async (req, res) => {
    try {
      // For simplicity, use userId 1
      const userId = 1;
      
      const result = addWaterSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const { amount } = result.data;
      
      const intake = await storage.addWaterIntake({
        userId,
        amount,
        timestamp: new Date().toISOString()
      });
      
      // Get updated total for today
      const today = new Date().toISOString().split('T')[0];
      const intakes = await storage.getWaterIntake(userId, today);
      const totalIntake = intakes.reduce((sum, intake) => sum + intake.amount, 0);
      
      res.json({ intake, totalIntake });
    } catch (err) {
      console.error("Error adding water intake:", err);
      res.status(500).json({ message: "Failed to add water intake" });
    }
  });
  
  // Reset water intake for today
  app.delete("/api/water-intake", async (req, res) => {
    try {
      // For simplicity, use userId 1
      const userId = 1;
      
      await storage.clearWaterIntake(userId);
      
      res.json({ message: "Water intake data reset successfully" });
    } catch (err) {
      console.error("Error resetting water intake:", err);
      res.status(500).json({ message: "Failed to reset water intake" });
    }
  });
  
  // Get reminder settings
  app.get("/api/reminder-settings", async (req, res) => {
    try {
      // For simplicity, use userId 1
      const userId = 1;
      
      const settings = await storage.getReminderSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Reminder settings not found" });
      }
      
      res.json(settings);
    } catch (err) {
      console.error("Error fetching reminder settings:", err);
      res.status(500).json({ message: "Failed to fetch reminder settings" });
    }
  });
  
  // Update reminder settings
  app.patch("/api/reminder-settings", async (req, res) => {
    try {
      // For simplicity, use userId 1 and settingsId 1
      const userId = 1;
      const settingsId = 1;
      
      const result = updateReminderSettingsSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedSettings = await storage.updateReminderSettings(settingsId, result.data);
      
      if (!updatedSettings) {
        return res.status(404).json({ message: "Reminder settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (err) {
      console.error("Error updating reminder settings:", err);
      res.status(500).json({ message: "Failed to update reminder settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
