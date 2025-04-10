import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { requestNotificationPermission, sendTestNotification } from "@/lib/notification";
import { saveReminderSettings, loadReminderSettings } from "@/lib/localStorageUtils";

type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

type ReminderSettings = {
  active: boolean;
  interval: number;
  startTime: string;
  endTime: string;
  days: Record<DayOfWeek, boolean>;
  notificationsEnabled: boolean;
};

export default function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>({
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
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "default">("default");
  
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Fetch reminder settings
  const { data: reminderData } = useQuery({
    queryKey: ["/api/reminder-settings"],
    onSuccess: (data) => {
      if (data) {
        // Map backend data to component state
        setSettings({
          active: data.active,
          interval: data.interval,
          startTime: data.startTime,
          endTime: data.endTime,
          days: {
            mon: data.monday,
            tue: data.tuesday,
            wed: data.wednesday,
            thu: data.thursday,
            fri: data.friday,
            sat: data.saturday,
            sun: data.sunday
          },
          notificationsEnabled: data.notificationsEnabled
        });
        
        // Save to local storage
        saveReminderSettings({
          active: data.active,
          interval: data.interval,
          startTime: data.startTime,
          endTime: data.endTime,
          days: {
            mon: data.monday,
            tue: data.tuesday,
            wed: data.wednesday,
            thu: data.thursday,
            fri: data.friday,
            sat: data.saturday,
            sun: data.sunday
          },
          notificationsEnabled: data.notificationsEnabled
        });
      }
    },
    onError: () => {
      // If API fails, load from local storage
      const savedSettings = loadReminderSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    }
  });
  
  // Update reminder settings mutation
  const updateReminderMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<ReminderSettings>) => {
      // Map component state to backend data structure
      const backendData: Record<string, any> = {};
      
      if (updatedSettings.active !== undefined) {
        backendData.active = updatedSettings.active;
      }
      
      if (updatedSettings.interval !== undefined) {
        backendData.interval = updatedSettings.interval;
      }
      
      if (updatedSettings.startTime !== undefined) {
        backendData.startTime = updatedSettings.startTime;
      }
      
      if (updatedSettings.endTime !== undefined) {
        backendData.endTime = updatedSettings.endTime;
      }
      
      if (updatedSettings.notificationsEnabled !== undefined) {
        backendData.notificationsEnabled = updatedSettings.notificationsEnabled;
      }
      
      if (updatedSettings.days) {
        backendData.monday = updatedSettings.days.mon;
        backendData.tuesday = updatedSettings.days.tue;
        backendData.wednesday = updatedSettings.days.wed;
        backendData.thursday = updatedSettings.days.thu;
        backendData.friday = updatedSettings.days.fri;
        backendData.saturday = updatedSettings.days.sat;
        backendData.sunday = updatedSettings.days.sun;
      }
      
      return apiRequest("PATCH", "/api/reminder-settings", backendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminder-settings"] });
    }
  });
  
  // Handle toggle reminder
  const handleToggleReminder = (active: boolean) => {
    setSettings(prev => ({ ...prev, active }));
    updateReminderMutation.mutate({ active });
    saveReminderSettings({ ...settings, active });
  };
  
  // Handle toggle notifications
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        setSettings(prev => ({ ...prev, notificationsEnabled: true }));
        updateReminderMutation.mutate({ notificationsEnabled: true });
        saveReminderSettings({ ...settings, notificationsEnabled: true });
        setNotificationPermission("granted");
      } else {
        // If permission denied, revert the switch
        return;
      }
    } else {
      setSettings(prev => ({ ...prev, notificationsEnabled: false }));
      updateReminderMutation.mutate({ notificationsEnabled: false });
      saveReminderSettings({ ...settings, notificationsEnabled: false });
    }
  };
  
  // Handle interval change
  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value);
    setSettings(prev => ({ ...prev, interval }));
    updateReminderMutation.mutate({ interval });
    saveReminderSettings({ ...settings, interval });
  };
  
  // Handle time change
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    updateReminderMutation.mutate({ [field]: value });
    saveReminderSettings({ ...settings, [field]: value });
  };
  
  // Handle day toggle
  const handleDayToggle = (day: DayOfWeek) => {
    const updatedDays = { ...settings.days, [day]: !settings.days[day] };
    setSettings(prev => ({ ...prev, days: updatedDays }));
    updateReminderMutation.mutate({ days: updatedDays });
    saveReminderSettings({ ...settings, days: updatedDays });
  };
  
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-nunito font-bold text-xl text-[#333333]">Reminders</h2>
        <div className="flex items-center">
          <span className={`text-sm mr-2 font-medium ${settings.active ? 'text-[#4CAF50]' : 'text-[#757575]'}`}>
            {settings.active ? 'Active' : 'Inactive'}
          </span>
          <Switch 
            checked={settings.active} 
            onCheckedChange={handleToggleReminder}
            className="data-[state=checked]:bg-[#4CAF50]"
          />
        </div>
      </div>

      <Card className="bg-white rounded-lg shadow-md p-6 mb-4">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h3 className="font-nunito font-medium text-lg mb-1">Reminder Frequency</h3>
              <p className="text-[#757575] text-sm">Set how often you want to be reminded</p>
            </div>
            <div>
              <Select value={settings.interval.toString()} onValueChange={handleIntervalChange}>
                <SelectTrigger className="bg-[#F5F8FA] border-[#E0E0E0] rounded-lg px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-[#00BCD4]">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every 1 hour</SelectItem>
                  <SelectItem value="90">Every 1.5 hours</SelectItem>
                  <SelectItem value="120">Every 2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-6 mb-6">
            <h3 className="font-nunito font-medium text-lg mb-4">Active Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time" className="block text-[#757575] text-sm mb-2">Start Time</Label>
                <Input 
                  type="time" 
                  id="start-time" 
                  value={settings.startTime} 
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  className="bg-[#F5F8FA] border-[#E0E0E0] rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
                />
              </div>
              <div>
                <Label htmlFor="end-time" className="block text-[#757575] text-sm mb-2">End Time</Label>
                <Input 
                  type="time" 
                  id="end-time" 
                  value={settings.endTime} 
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  className="bg-[#F5F8FA] border-[#E0E0E0] rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-6">
            <h3 className="font-nunito font-medium text-lg mb-4">Days</h3>
            <div className="flex flex-wrap gap-2">
              {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as DayOfWeek[]).map((day, index) => (
                <Button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`w-10 h-10 rounded-full font-medium transition-colors duration-200 
                    ${settings.days[day] 
                      ? 'bg-[#00BCD4] text-white hover:bg-[#00ACC1]' 
                      : 'bg-white border-2 border-[#E0E0E0] text-[#757575] hover:bg-[#F5F8FA]'
                    }`
                  }
                >
                  {day === "mon" ? "M" : 
                   day === "tue" ? "T" : 
                   day === "wed" ? "W" : 
                   day === "thu" ? "T" : 
                   day === "fri" ? "F" : 
                   day === "sat" ? "S" : "S"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-lg shadow-md p-6 mb-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-nunito font-medium text-lg">Push Notifications</h3>
            <Switch 
              checked={settings.notificationsEnabled} 
              onCheckedChange={handleToggleNotifications}
              className="data-[state=checked]:bg-[#4CAF50]"
            />
          </div>
          <p className="text-[#757575] text-sm">Allow browser notifications to remind you to drink water</p>
          
          <div className="mt-4">
            {notificationPermission === "granted" && settings.notificationsEnabled ? (
              <div className="bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] p-3 rounded-lg flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="24" 
                  height="24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                  <p className="font-medium">Notifications are enabled</p>
                  <p className="text-sm">You'll receive reminders according to your schedule</p>
                </div>
              </div>
            ) : notificationPermission === "denied" ? (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="24" 
                  height="24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2 mt-0.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <p className="font-medium">Notifications are blocked</p>
                  <p className="text-sm">Please enable notifications in your browser settings</p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-100 text-amber-600 p-3 rounded-lg flex items-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  width="24" 
                  height="24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2 mt-0.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div>
                  <p className="font-medium">Notifications require permission</p>
                  <p className="text-sm">Enable the toggle to request notification access</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center mt-6">
        <Button 
          onClick={() => sendTestNotification()}
          variant="outline"
          className="bg-white border border-[#00BCD4] text-[#00BCD4] hover:bg-[#00BCD4] hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Send Test Notification
        </Button>
      </div>
    </section>
  );
}
