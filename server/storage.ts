import { 
  users, type User, type InsertUser,
  settings, type Settings, type InsertSettings,
  waterIntake, type WaterIntake, type InsertWaterIntake,
  reminderSettings, type ReminderSettings, type InsertReminderSettings
} from "@shared/schema";

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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private settingsMap: Map<number, Settings>;
  private waterIntakeMap: Map<number, WaterIntake[]>;
  private reminderSettingsMap: Map<number, ReminderSettings>;
  
  private currentUserId: number;
  private currentSettingsId: number;
  private currentWaterIntakeId: number;
  private currentReminderSettingsId: number;

  constructor() {
    this.users = new Map();
    this.settingsMap = new Map();
    this.waterIntakeMap = new Map();
    this.reminderSettingsMap = new Map();
    
    this.currentUserId = 1;
    this.currentSettingsId = 1;
    this.currentWaterIntakeId = 1;
    this.currentReminderSettingsId = 1;
    
    // Create a test user with ID 1
    const testUser: User = {
      id: this.currentUserId,
      username: 'test',
      password: 'test'
    };
    this.users.set(testUser.id, testUser);
    
    // Create default settings for the test user
    const defaultSettings: Settings = {
      id: this.currentSettingsId,
      dailyGoal: 2.5,
      defaultCupSize: 350,
      soundEnabled: false
    };
    this.settingsMap.set(defaultSettings.id, defaultSettings);
    
    // Create default reminder settings for the test user
    const defaultReminderSettings: ReminderSettings = {
      id: this.currentReminderSettingsId,
      userId: testUser.id,
      active: true,
      interval: 60,
      startTime: "08:00",
      endTime: "20:00",
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      notificationsEnabled: true
    };
    this.reminderSettingsMap.set(defaultReminderSettings.id, defaultReminderSettings);
    
    // Initialize empty water intake array for the test user
    this.waterIntakeMap.set(testUser.id, []);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    // In this simple implementation, we're just returning the first settings object
    // In a real app, we would filter by userId
    const settings = Array.from(this.settingsMap.values())[0];
    return settings;
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.currentSettingsId++;
    const settings: Settings = { ...insertSettings, id };
    this.settingsMap.set(id, settings);
    return settings;
  }
  
  async updateSettings(id: number, updatedSettings: Partial<InsertSettings>): Promise<Settings | undefined> {
    const settings = this.settingsMap.get(id);
    if (!settings) return undefined;
    
    const updated: Settings = { ...settings, ...updatedSettings };
    this.settingsMap.set(id, updated);
    return updated;
  }
  
  // Water intake methods
  async getWaterIntake(userId: number, date?: string): Promise<WaterIntake[]> {
    const intakes = this.waterIntakeMap.get(userId) || [];
    if (!date) return intakes;
    
    return intakes.filter(intake => {
      const intakeDate = new Date(intake.timestamp).toDateString();
      const compareDate = new Date(date).toDateString();
      return intakeDate === compareDate;
    });
  }
  
  async addWaterIntake(insertIntake: InsertWaterIntake): Promise<WaterIntake> {
    const id = this.currentWaterIntakeId++;
    const intake: WaterIntake = { ...insertIntake, id };
    
    const userIntakes = this.waterIntakeMap.get(insertIntake.userId) || [];
    userIntakes.push(intake);
    this.waterIntakeMap.set(insertIntake.userId, userIntakes);
    
    return intake;
  }
  
  async clearWaterIntake(userId: number): Promise<void> {
    this.waterIntakeMap.set(userId, []);
  }
  
  // Reminder settings methods
  async getReminderSettings(userId: number): Promise<ReminderSettings | undefined> {
    return Array.from(this.reminderSettingsMap.values()).find(
      settings => settings.userId === userId
    );
  }
  
  async createReminderSettings(insertSettings: InsertReminderSettings): Promise<ReminderSettings> {
    const id = this.currentReminderSettingsId++;
    const settings: ReminderSettings = { ...insertSettings, id };
    this.reminderSettingsMap.set(id, settings);
    return settings;
  }
  
  async updateReminderSettings(id: number, updatedSettings: Partial<InsertReminderSettings>): Promise<ReminderSettings | undefined> {
    const settings = this.reminderSettingsMap.get(id);
    if (!settings) return undefined;
    
    const updated: ReminderSettings = { ...settings, ...updatedSettings };
    this.reminderSettingsMap.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
