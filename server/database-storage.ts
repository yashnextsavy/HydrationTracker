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
    const [setting] = await db.select().from(settings);
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
}