import { 
  users, type User, type InsertUser,
  settings, type Settings, type InsertSettings,
  waterIntake, type WaterIntake, type InsertWaterIntake,
  reminderSettings, type ReminderSettings, type InsertReminderSettings,
  streaks, type Streak, type InsertStreak,
  achievements, type Achievement, type InsertAchievement,
  reminderMessages, type ReminderMessage, type InsertReminderMessage,
  hydrationTips, type HydrationTip
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage";

// Interface definition for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(id: number, settings: Partial<InsertSettings>): Promise<Settings | undefined>;
  
  // Water intake methods
  getWaterIntake(userId: number, date?: string): Promise<WaterIntake[]>;
  addWaterIntake(intake: InsertWaterIntake): Promise<WaterIntake>;
  clearWaterIntake(userId: number): Promise<void>;
  getWaterIntakeHistory(userId: number, startDate: string, endDate: string): Promise<WaterIntake[]>;
  
  // Reminder settings methods
  getReminderSettings(userId: number): Promise<ReminderSettings | undefined>;
  createReminderSettings(reminderSettings: InsertReminderSettings): Promise<ReminderSettings>;
  updateReminderSettings(id: number, settings: Partial<InsertReminderSettings>): Promise<ReminderSettings | undefined>;
  
  // Streak methods
  getStreak(userId: number): Promise<Streak | undefined>;
  createStreak(streak: InsertStreak): Promise<Streak>;
  updateStreak(id: number, streak: Partial<InsertStreak>): Promise<Streak | undefined>;
  
  // Achievement methods
  getAchievements(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined>;
  
  // Reminder message methods
  getReminderMessages(userId: number): Promise<ReminderMessage[]>;
  createReminderMessage(message: InsertReminderMessage): Promise<ReminderMessage>;
  updateReminderMessage(id: number, message: Partial<InsertReminderMessage>): Promise<ReminderMessage | undefined>;
  deleteReminderMessage(id: number): Promise<void>;
  
  // Hydration tip methods
  getHydrationTips(): Promise<HydrationTip[]>;
  getRandomHydrationTip(category?: string): Promise<HydrationTip | undefined>;
}

export const storage = new DatabaseStorage();
