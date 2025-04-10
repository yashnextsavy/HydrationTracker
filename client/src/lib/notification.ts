// Function to request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notifications");
    return "denied";
  }
  
  if (Notification.permission === "granted") {
    return "granted";
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
};

// Hydration notification sound effect
const createNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playWaterSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };
    
    return playWaterSound;
  } catch (error) {
    console.error("Web Audio API not supported:", error);
    return () => {}; // Return empty function if audio API is not supported
  }
};

// Function to send hydration notification
export const sendHydrationNotification = (
  message: string = "Time to drink water! Stay hydrated.",
  playSound: boolean = false
) => {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notifications");
    return;
  }
  
  if (Notification.permission === "granted") {
    const notification = new Notification("Hydration Reminder", {
      body: message,
      icon: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='48' height='48' fill='none' stroke='%2300BCD4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v6m0 0s-3-2-3-4m3 4s3-2 3-4M4 9h16l-1.37 9.58a2 2 0 0 1-1.97 1.42H7.34a2 2 0 0 1-1.97-1.42L4 9z'/%3E%3Cpath d='M7 14.5h10'/%3E%3C/svg%3E"
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    if (playSound) {
      const playSound = createNotificationSound();
      playSound();
    }
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        sendHydrationNotification(message, playSound);
      }
    });
  }
};

// Function to send a test notification
export const sendTestNotification = () => {
  sendHydrationNotification("This is a test notification. Click to dismiss.");
};

// Function to schedule notifications based on user settings
export const scheduleNotifications = (
  interval: number,  // in minutes
  startTime: string, // in HH:MM format
  endTime: string,   // in HH:MM format
  activeDays: Record<string, boolean>,
  enabled: boolean,
  soundEnabled: boolean
) => {
  // Clear any existing notification timers
  clearNotificationSchedule();
  
  if (!enabled) return;
  
  // Convert start and end times to Date objects for comparison
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const parseTimeToDate = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(todayStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  const startDate = parseTimeToDate(startTime);
  const endDate = parseTimeToDate(endTime);
  
  // Don't schedule if outside active hours
  if (now < startDate || now > endDate) return;
  
  // Check if today is an active day
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayName = dayNames[now.getDay()];
  if (!activeDays[todayName]) return;
  
  // Create a timer that fires every 'interval' minutes
  const timerId = setInterval(() => {
    const currentTime = new Date();
    
    // Check if current time is within active hours
    if (currentTime >= startDate && currentTime <= endDate) {
      // Check if today is still an active day
      const currentDayName = dayNames[currentTime.getDay()];
      if (activeDays[currentDayName]) {
        sendHydrationNotification(undefined, soundEnabled);
      }
    } else {
      // Outside active hours, reschedule for next day
      clearNotificationSchedule();
    }
  }, interval * 60 * 1000); // Convert minutes to milliseconds
  
  // Store the timer ID so it can be cleared later
  (window as any).__hydroNotificationTimer = timerId;
};

// Function to clear scheduled notifications
export const clearNotificationSchedule = () => {
  if ((window as any).__hydroNotificationTimer) {
    clearInterval((window as any).__hydroNotificationTimer);
    (window as any).__hydroNotificationTimer = null;
  }
};
