import { 
  users, type User, type InsertUser,
  settings, type Settings, type InsertSettings,
  waterIntake, type WaterIntake, type InsertWaterIntake,
  reminderSettings, type ReminderSettings, type InsertReminderSettings,
  streaks, type Streak, type InsertStreak,
  achievements, type Achievement, type InsertAchievement,
  reminderMessages, type ReminderMessage, type InsertReminderMessage,
  hydrationTips, type HydrationTip, type InsertHydrationTip
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, between, or, sql } from "drizzle-orm";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting || undefined;
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [setting] = await db
      .insert(settings)
      .values(insertSettings)
      .returning();
    return setting;
  }
  
  async updateSettings(id: number, updatedSettings: Partial<InsertSettings>): Promise<Settings | undefined> {
    const [setting] = await db
      .update(settings)
      .set(updatedSettings)
      .where(eq(settings.id, id))
      .returning();
    return setting || undefined;
  }
  
  // Water intake methods
  async getWaterIntake(userId: number, date?: string): Promise<WaterIntake[]> {
    // Get all water intake records for this user
    const intakes = await db
      .select()
      .from(waterIntake)
      .where(eq(waterIntake.userId, userId));
      
    // If date is provided, filter in-memory
    if (date) {
      return intakes.filter(intake => {
        const intakeDate = new Date(intake.timestamp).toDateString();
        const compareDate = new Date(date).toDateString();
        return intakeDate === compareDate;
      });
    }
    
    return intakes;
  }
  
  async getWaterIntakeHistory(userId: number, startDate: string, endDate: string): Promise<WaterIntake[]> {
    // Get water intake records for this user between the specified dates
    const intakes = await db
      .select()
      .from(waterIntake)
      .where(eq(waterIntake.userId, userId));
      
    // Filter by date range in-memory
    return intakes.filter(intake => {
      const intakeDate = new Date(intake.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      
      return intakeDate >= start && intakeDate <= end;
    });
  }
  
  async addWaterIntake(insertIntake: InsertWaterIntake): Promise<WaterIntake> {
    const [intake] = await db
      .insert(waterIntake)
      .values(insertIntake)
      .returning();
    return intake;
  }
  
  async clearWaterIntake(userId: number): Promise<void> {
    await db
      .delete(waterIntake)
      .where(eq(waterIntake.userId, userId));
  }
  
  // Reminder settings methods
  async getReminderSettings(userId: number): Promise<ReminderSettings | undefined> {
    const [reminderSetting] = await db
      .select()
      .from(reminderSettings)
      .where(eq(reminderSettings.userId, userId));
    return reminderSetting || undefined;
  }
  
  async createReminderSettings(insertReminderSetting: InsertReminderSettings): Promise<ReminderSettings> {
    const [reminderSetting] = await db
      .insert(reminderSettings)
      .values(insertReminderSetting)
      .returning();
    return reminderSetting;
  }
  
  async updateReminderSettings(id: number, updatedSettings: Partial<InsertReminderSettings>): Promise<ReminderSettings | undefined> {
    const [reminderSetting] = await db
      .update(reminderSettings)
      .set(updatedSettings)
      .where(eq(reminderSettings.id, id))
      .returning();
    return reminderSetting || undefined;
  }
  
  // Streak methods
  async getStreak(userId: number): Promise<Streak | undefined> {
    const [streak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId));
    return streak || undefined;
  }
  
  async createStreak(insertStreak: InsertStreak): Promise<Streak> {
    const [streak] = await db
      .insert(streaks)
      .values(insertStreak)
      .returning();
    return streak;
  }
  
  async updateStreak(id: number, updatedStreak: Partial<InsertStreak>): Promise<Streak | undefined> {
    const [streak] = await db
      .update(streaks)
      .set(updatedStreak)
      .where(eq(streaks.id, id))
      .returning();
    return streak || undefined;
  }
  
  // Achievement methods
  async getAchievements(userId: number): Promise<Achievement[]> {
    return db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));
  }
  
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }
  
  async updateAchievement(id: number, updatedAchievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const [achievement] = await db
      .update(achievements)
      .set(updatedAchievement)
      .where(eq(achievements.id, id))
      .returning();
    return achievement || undefined;
  }
  
  // Reminder message methods
  async getReminderMessages(userId: number): Promise<ReminderMessage[]> {
    return db
      .select()
      .from(reminderMessages)
      .where(eq(reminderMessages.userId, userId));
  }
  
  async createReminderMessage(insertMessage: InsertReminderMessage): Promise<ReminderMessage> {
    const [message] = await db
      .insert(reminderMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  async updateReminderMessage(id: number, updatedMessage: Partial<InsertReminderMessage>): Promise<ReminderMessage | undefined> {
    const [message] = await db
      .update(reminderMessages)
      .set(updatedMessage)
      .where(eq(reminderMessages.id, id))
      .returning();
    return message || undefined;
  }
  
  async deleteReminderMessage(id: number): Promise<void> {
    await db
      .delete(reminderMessages)
      .where(eq(reminderMessages.id, id));
  }
  
  // Hydration tip methods
  async getHydrationTips(): Promise<HydrationTip[]> {
    return db
      .select()
      .from(hydrationTips);
  }
  
  async getRandomHydrationTip(category?: string): Promise<HydrationTip | undefined> {
    let tips: HydrationTip[];
    
    if (category) {
      tips = await db
        .select()
        .from(hydrationTips)
        .where(eq(hydrationTips.category, category));
    } else {
      tips = await db
        .select()
        .from(hydrationTips);
    }
    
    if (tips.length === 0) {
      return undefined;
    }
    
    // Return a random tip
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }
  
  async createHydrationTip(tip: InsertHydrationTip): Promise<HydrationTip> {
    const [newTip] = await db
      .insert(hydrationTips)
      .values(tip)
      .returning();
    return newTip;
  }
}