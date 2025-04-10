import { pgTable, text, serial, integer, boolean, real, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dailyGoal: real("daily_goal").notNull().default(2.5),
  defaultCupSize: integer("default_cup_size").notNull().default(350),
  soundEnabled: boolean("sound_enabled").notNull().default(false),
});

// User's daily water intake
export const waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  timestamp: text("timestamp").notNull(),
});

// Reminder settings
export const reminderSettings = pgTable("reminder_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  active: boolean("active").notNull().default(true),
  interval: integer("interval").notNull().default(60),
  startTime: text("start_time").notNull().default("08:00"),
  endTime: text("end_time").notNull().default("20:00"),
  monday: boolean("monday").notNull().default(true),
  tuesday: boolean("tuesday").notNull().default(true),
  wednesday: boolean("wednesday").notNull().default(true),
  thursday: boolean("thursday").notNull().default(true),
  friday: boolean("friday").notNull().default(true),
  saturday: boolean("saturday").notNull().default(false),
  sunday: boolean("sunday").notNull().default(false),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
});

// User streaks - track consecutive days meeting hydration goals
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastUpdated: date("last_updated").notNull(),
});

// User achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  achieved: boolean("achieved").notNull().default(false),
  achievedDate: timestamp("achieved_date"),
  type: text("type").notNull(), // Type of achievement (streak, intake, etc.)
  thresholdValue: integer("threshold_value").notNull(), // Value needed to unlock achievement
});

// Custom reminder messages
export const reminderMessages = pgTable("reminder_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Hydration tips
export const hydrationTips = pgTable("hydration_tips", {
  id: serial("id").primaryKey(),
  tip: text("tip").notNull(),
  category: text("category").notNull(),
});

// Schema definitions for inserts
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({ id: true });
export const insertReminderSettingsSchema = createInsertSchema(reminderSettings).omit({ id: true });
export const insertStreakSchema = createInsertSchema(streaks).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertReminderMessageSchema = createInsertSchema(reminderMessages).omit({ id: true });
export const insertHydrationTipSchema = createInsertSchema(hydrationTips).omit({ id: true });

// Types for inserts
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export type InsertReminderSettings = z.infer<typeof insertReminderSettingsSchema>;
export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertReminderMessage = z.infer<typeof insertReminderMessageSchema>;
export type InsertHydrationTip = z.infer<typeof insertHydrationTipSchema>;

// Types for selects
export type Settings = typeof settings.$inferSelect;
export type WaterIntake = typeof waterIntake.$inferSelect;
export type ReminderSettings = typeof reminderSettings.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type ReminderMessage = typeof reminderMessages.$inferSelect;
export type HydrationTip = typeof hydrationTips.$inferSelect;

// Additional schemas for API
export const addWaterSchema = z.object({
  amount: z.number().positive(),
});

export const updateGoalSchema = z.object({
  dailyGoal: z.number().min(0.5).max(10),
  defaultCupSize: z.number().min(50).max(2000).optional(),
  soundEnabled: z.boolean().optional(),
});

export const updateReminderSettingsSchema = z.object({
  active: z.boolean().optional(),
  interval: z.number().min(15).max(240).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
});

export const createReminderMessageSchema = z.object({
  message: z.string().min(5).max(200),
  isActive: z.boolean().optional(),
});

export const updateReminderMessageSchema = z.object({
  message: z.string().min(5).max(200).optional(),
  isActive: z.boolean().optional(),
});

export const getWaterHistorySchema = z.object({
  startDate: z.string(), // ISO date string
  endDate: z.string(), // ISO date string
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
