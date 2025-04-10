import { 
  users, type User, type InsertUser,
  settings, type Settings, type InsertSettings,
  waterIntake, type WaterIntake, type InsertWaterIntake,
  reminderSettings, type ReminderSettings, type InsertReminderSettings
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
  
  // Reminder settings methods
  getReminderSettings(userId: number): Promise<ReminderSettings | undefined>;
  createReminderSettings(reminderSettings: InsertReminderSettings): Promise<ReminderSettings>;
  updateReminderSettings(id: number, settings: Partial<InsertReminderSettings>): Promise<ReminderSettings | undefined>;
}

export const storage = new DatabaseStorage();
