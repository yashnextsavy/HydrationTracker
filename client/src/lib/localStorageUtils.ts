// Type definitions for localStorage items
type StoredSettings = {
  dailyGoal: number;
  defaultCupSize: number;
  soundEnabled: boolean;
};

type StoredReminderSettings = {
  active: boolean;
  interval: number;
  startTime: string;
  endTime: string;
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
  };
  notificationsEnabled: boolean;
};

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'hydro_settings',
  REMINDER_SETTINGS: 'hydro_reminder_settings',
  WATER_INTAKE: 'hydro_water_intake',
  INTAKE_DATE: 'hydro_intake_date'
};

// Helper function to safely parse localStorage data
const safelyParse = <T>(jsonString: string | null, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing stored data:', e);
    return defaultValue;
  }
};

// Settings Storage Functions
export const saveSettings = (settings: StoredSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): StoredSettings | null => {
  const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!storedSettings) return null;
  
  return safelyParse<StoredSettings>(storedSettings, {
    dailyGoal: 2.5,
    defaultCupSize: 350,
    soundEnabled: false
  });
};

// Reminder Settings Storage Functions
export const saveReminderSettings = (settings: StoredReminderSettings): void => {
  localStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
};

export const loadReminderSettings = (): StoredReminderSettings | null => {
  const storedSettings = localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
  if (!storedSettings) return null;
  
  return safelyParse<StoredReminderSettings>(storedSettings, {
    active: true,
    interval: 60,
    startTime: "08:00",
    endTime: "20:00",
    days: {
      mon: true,
      tue: true,
      wed: true,
      thu: true,
      fri: true,
      sat: false,
      sun: false
    },
    notificationsEnabled: true
  });
};

// Water Intake Storage Functions
export const saveWaterIntake = (amount: number): void => {
  // Store the current date to detect day changes
  const today = new Date().toISOString().split('T')[0];
  const storedDate = localStorage.getItem(STORAGE_KEYS.INTAKE_DATE);
  
  // Reset intake if it's a new day
  if (storedDate !== today) {
    localStorage.setItem(STORAGE_KEYS.INTAKE_DATE, today);
  }
  
  localStorage.setItem(STORAGE_KEYS.WATER_INTAKE, amount.toString());
};

export const loadWaterIntake = (): number | null => {
  // Check if the stored date matches today
  const today = new Date().toISOString().split('T')[0];
  const storedDate = localStorage.getItem(STORAGE_KEYS.INTAKE_DATE);
  
  // If it's a new day, return null to fetch fresh data
  if (storedDate !== today) {
    localStorage.setItem(STORAGE_KEYS.INTAKE_DATE, today);
    localStorage.removeItem(STORAGE_KEYS.WATER_INTAKE);
    return null;
  }
  
  const intakeStr = localStorage.getItem(STORAGE_KEYS.WATER_INTAKE);
  if (!intakeStr) return null;
  
  const intake = parseFloat(intakeStr);
  return isNaN(intake) ? null : intake;
};

// Clear all stored data
export const clearAllStoredData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.REMINDER_SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.WATER_INTAKE);
  localStorage.removeItem(STORAGE_KEYS.INTAKE_DATE);
};
