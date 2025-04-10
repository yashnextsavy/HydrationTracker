import { pgTable, text, serial, integer, boolean, real, time } from "drizzle-orm/pg-core";
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

// Schema definitions for inserts
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({ id: true });
export const insertReminderSettingsSchema = createInsertSchema(reminderSettings).omit({ id: true });

// Types for inserts
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
export type InsertReminderSettings = z.infer<typeof insertReminderSettingsSchema>;

// Types for selects
export type Settings = typeof settings.$inferSelect;
export type WaterIntake = typeof waterIntake.$inferSelect;
export type ReminderSettings = typeof reminderSettings.$inferSelect;

// Additional schemas for API
export const addWaterSchema = z.object({
  amount: z.number().positive(),
});

export const updateGoalSchema = z.object({
  dailyGoal: z.number().min(0.5).max(10),
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
