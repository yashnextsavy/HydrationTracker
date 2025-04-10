import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { addWaterSchema, updateGoalSchema, updateReminderSettingsSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized - Please log in" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API endpoints for the hydration reminder app
  
  // Get user settings
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      let settings = await storage.getSettings(userId);
      
      // If settings don't exist yet, create default settings
      if (!settings) {
        settings = await storage.createSettings({
          userId,
          dailyGoal: 2.5, // 2.5 liters
          defaultCupSize: 350, // 350ml
          soundEnabled: false
        });
      }
      
      res.json(settings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // Update user settings
  app.patch("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = updateGoalSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Get settings id
      let settings = await storage.getSettings(userId);
      
      // If settings don't exist yet, create them
      if (!settings) {
        settings = await storage.createSettings({
          userId,
          ...result.data
        });
        return res.json(settings);
      }
      
      // Update existing settings
      const updatedSettings = await storage.updateSettings(settings.id, result.data);
      
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
  app.get("/api/water-intake", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
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
  app.post("/api/water-intake", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
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
  app.delete("/api/water-intake", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      await storage.clearWaterIntake(userId);
      
      res.json({ message: "Water intake data reset successfully" });
    } catch (err) {
      console.error("Error resetting water intake:", err);
      res.status(500).json({ message: "Failed to reset water intake" });
    }
  });
  
  // Get reminder settings
  app.get("/api/reminder-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      let settings = await storage.getReminderSettings(userId);
      
      // If settings don't exist yet, create default settings
      if (!settings) {
        settings = await storage.createReminderSettings({
          userId,
          active: true,
          interval: 60, // 60 minutes
          startTime: "08:00",
          endTime: "20:00",
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
          notificationsEnabled: true
        });
      }
      
      res.json(settings);
    } catch (err) {
      console.error("Error fetching reminder settings:", err);
      res.status(500).json({ message: "Failed to fetch reminder settings" });
    }
  });
  
  // Update reminder settings
  app.patch("/api/reminder-settings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = updateReminderSettingsSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Get settings id
      let settings = await storage.getReminderSettings(userId);
      
      // If settings don't exist yet, create them
      if (!settings) {
        settings = await storage.createReminderSettings({
          userId,
          ...result.data
        });
        return res.json(settings);
      }
      
      // Update existing settings
      const updatedSettings = await storage.updateReminderSettings(settings.id, result.data);
      
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
