import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  addWaterSchema, 
  updateGoalSchema, 
  updateReminderSettingsSchema, 
  getWaterHistorySchema, 
  createReminderMessageSchema,
  updateReminderMessageSchema,
  hydrationTips,
  type InsertHydrationTip
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { db } from "./db";

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

  // Get water intake history
  app.post("/api/water-intake/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = getWaterHistorySchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const { startDate, endDate } = result.data;
      
      const intakes = await storage.getWaterIntakeHistory(userId, startDate, endDate);
      
      // Process data for daily totals
      const dailyTotals: Record<string, number> = {};
      
      intakes.forEach(intake => {
        const day = new Date(intake.timestamp).toISOString().split('T')[0];
        dailyTotals[day] = (dailyTotals[day] || 0) + intake.amount;
      });
      
      res.json({ 
        intakes, 
        dailyTotals: Object.entries(dailyTotals).map(([date, amount]) => ({
          date,
          amount
        }))
      });
    } catch (err) {
      console.error("Error fetching water intake history:", err);
      res.status(500).json({ message: "Failed to fetch water intake history" });
    }
  });

  // Get user streak data
  app.get("/api/streaks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      let streak = await storage.getStreak(userId);
      
      // If streak doesn't exist yet, create default streak
      if (!streak) {
        streak = await storage.createStreak({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }
      
      res.json(streak);
    } catch (err) {
      console.error("Error fetching streak:", err);
      res.status(500).json({ message: "Failed to fetch streak data" });
    }
  });

  // Update user streak data (used by the system when water goal is achieved)
  app.patch("/api/streaks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const today = new Date().toISOString().split('T')[0];
      
      // Get current settings for daily goal
      const settings = await storage.getSettings(userId);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      // Get today's water intake
      const intakes = await storage.getWaterIntake(userId, today);
      const totalIntake = intakes.reduce((sum, intake) => sum + intake.amount, 0);
      
      // Check if daily goal was met
      const goalMet = totalIntake >= settings.dailyGoal;
      
      // Get current streak
      let streak = await storage.getStreak(userId);
      
      // If streak doesn't exist, create it
      if (!streak) {
        streak = await storage.createStreak({
          userId,
          currentStreak: goalMet ? 1 : 0,
          longestStreak: goalMet ? 1 : 0,
          lastUpdated: today
        });
        return res.json(streak);
      }
      
      // Check if we need to update the streak
      if (streak.lastUpdated !== today) {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check if yesterday was the last update (maintaining streak)
        const isConsecutive = streak.lastUpdated === yesterdayStr;
        
        let newCurrentStreak = 0;
        if (goalMet) {
          newCurrentStreak = isConsecutive ? streak.currentStreak + 1 : 1;
        }
        
        const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
        
        // Update streak
        const updatedStreak = await storage.updateStreak(streak.id, {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastUpdated: today
        });
        
        res.json(updatedStreak);
      } else {
        // Already updated today, just return current streak
        res.json(streak);
      }
    } catch (err) {
      console.error("Error updating streak:", err);
      res.status(500).json({ message: "Failed to update streak data" });
    }
  });

  // Get user achievements
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      let achievements = await storage.getAchievements(userId);
      
      // If no achievements exist yet, create default achievements
      if (achievements.length === 0) {
        const defaultAchievements = [
          {
            userId,
            name: "First Sip",
            description: "Record your first water intake",
            type: "intake",
            thresholdValue: 1,
            achieved: false
          },
          {
            userId,
            name: "Hydration Novice",
            description: "Meet your daily water goal for 3 days in a row",
            type: "streak",
            thresholdValue: 3,
            achieved: false
          },
          {
            userId,
            name: "Hydration Enthusiast",
            description: "Meet your daily water goal for 7 days in a row",
            type: "streak",
            thresholdValue: 7,
            achieved: false
          },
          {
            userId,
            name: "Hydration Master",
            description: "Meet your daily water goal for 30 days in a row",
            type: "streak",
            thresholdValue: 30,
            achieved: false
          },
          {
            userId,
            name: "Water Tracker",
            description: "Record water intake for 10 consecutive days",
            type: "record",
            thresholdValue: 10,
            achieved: false
          }
        ];
        
        // Create each achievement
        achievements = await Promise.all(
          defaultAchievements.map(achievement => 
            storage.createAchievement(achievement)
          )
        );
      }
      
      res.json(achievements);
    } catch (err) {
      console.error("Error fetching achievements:", err);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Update achievement status (used by the system)
  app.patch("/api/achievements/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const achievementId = parseInt(req.params.id);
      
      // Get the achievement to check ownership
      const achievements = await storage.getAchievements(userId);
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      // Verify user owns this achievement
      if (achievement.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update the achievement
      const updatedAchievement = await storage.updateAchievement(achievementId, {
        achieved: true,
        achievedDate: new Date()
      });
      
      res.json(updatedAchievement);
    } catch (err) {
      console.error("Error updating achievement:", err);
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });

  // Get custom reminder messages
  app.get("/api/reminder-messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const messages = await storage.getReminderMessages(userId);
      
      // If no messages exist yet, create default messages
      if (messages.length === 0) {
        const defaultMessages = [
          {
            userId,
            message: "Time to hydrate! 💧",
            isActive: true
          },
          {
            userId,
            message: "Don't forget your water! 🚰",
            isActive: true
          },
          {
            userId,
            message: "Stay hydrated for better health! 🥤",
            isActive: true
          }
        ];
        
        // Create each message
        const createdMessages = await Promise.all(
          defaultMessages.map(message => 
            storage.createReminderMessage(message)
          )
        );
        
        res.json(createdMessages);
      } else {
        res.json(messages);
      }
    } catch (err) {
      console.error("Error fetching reminder messages:", err);
      res.status(500).json({ message: "Failed to fetch reminder messages" });
    }
  });

  // Create a new custom reminder message
  app.post("/api/reminder-messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const result = createReminderMessageSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const message = await storage.createReminderMessage({
        userId,
        ...result.data
      });
      
      res.json(message);
    } catch (err) {
      console.error("Error creating reminder message:", err);
      res.status(500).json({ message: "Failed to create reminder message" });
    }
  });

  // Update a custom reminder message
  app.patch("/api/reminder-messages/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const messageId = parseInt(req.params.id);
      
      const result = updateReminderMessageSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Get all messages to check ownership
      const messages = await storage.getReminderMessages(userId);
      const message = messages.find(m => m.id === messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Reminder message not found" });
      }
      
      // Verify user owns this message
      if (message.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Update the message
      const updatedMessage = await storage.updateReminderMessage(messageId, result.data);
      
      res.json(updatedMessage);
    } catch (err) {
      console.error("Error updating reminder message:", err);
      res.status(500).json({ message: "Failed to update reminder message" });
    }
  });

  // Delete a custom reminder message
  app.delete("/api/reminder-messages/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const messageId = parseInt(req.params.id);
      
      // Get all messages to check ownership
      const messages = await storage.getReminderMessages(userId);
      const message = messages.find(m => m.id === messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Reminder message not found" });
      }
      
      // Verify user owns this message
      if (message.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Delete the message
      await storage.deleteReminderMessage(messageId);
      
      res.json({ message: "Reminder message deleted successfully" });
    } catch (err) {
      console.error("Error deleting reminder message:", err);
      res.status(500).json({ message: "Failed to delete reminder message" });
    }
  });

  // Get hydration tips
  app.get("/api/hydration-tips", isAuthenticated, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      // Get all tips or filter by category
      const tips = category 
        ? await storage.getHydrationTips().then(tips => 
            tips.filter(tip => tip.category === category)
          )
        : await storage.getHydrationTips();
      
      // If no tips exist yet, create default tips
      if (tips.length === 0) {
        const defaultTips = [
          {
            tip: "Drinking water first thing in the morning helps activate your internal organs.",
            category: "general"
          },
          {
            tip: "Keep a water bottle with you at all times to encourage regular hydration.",
            category: "habit"
          },
          {
            tip: "Add flavor to your water with fresh fruits or cucumber to make it more enjoyable.",
            category: "habit"
          },
          {
            tip: "Proper hydration can help reduce headaches and improve concentration.",
            category: "health"
          },
          {
            tip: "Try drinking a glass of water 30 minutes before each meal to help with digestion.",
            category: "habit"
          },
          {
            tip: "Water helps maintain the balance of body fluids which aid in digestion, absorption, and circulation.",
            category: "health"
          },
          {
            tip: "Drinking adequate water can help improve skin complexion and maintain elasticity.",
            category: "health"
          },
          {
            tip: "Set reminder alarms on your phone to remind you to drink water throughout the day.",
            category: "habit"
          },
          {
            tip: "Water helps flush out toxins through sweat and urination.",
            category: "health"
          },
          {
            tip: "Herbal teas and clear soups count toward your daily water intake.",
            category: "general"
          }
        ];
        
        // Create all tips
        for (const tip of defaultTips) {
          await storage.createHydrationTip(tip as InsertHydrationTip);
        }
        
        // Return created tips
        const newTips = await storage.getHydrationTips();
        return res.json(newTips);
      }
      
      res.json(tips);
    } catch (err) {
      console.error("Error fetching hydration tips:", err);
      res.status(500).json({ message: "Failed to fetch hydration tips" });
    }
  });

  // Get random hydration tip
  app.get("/api/hydration-tips/random", isAuthenticated, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      const tip = await storage.getRandomHydrationTip(category);
      
      if (!tip) {
        return res.status(404).json({ message: "No tips found" });
      }
      
      res.json(tip);
    } catch (err) {
      console.error("Error fetching random hydration tip:", err);
      res.status(500).json({ message: "Failed to fetch random hydration tip" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
