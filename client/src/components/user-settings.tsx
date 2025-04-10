import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { saveSettings, loadSettings } from "@/lib/localStorageUtils";

type UserSettings = {
  dailyGoal: number;
  defaultCupSize: number;
  soundEnabled: boolean;
};

export default function UserSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    dailyGoal: 2.5,
    defaultCupSize: 350,
    soundEnabled: false
  });
  
  // Fetch user settings
  const { data: settingsData } = useQuery({
    queryKey: ["/api/settings"],
    onSuccess: (data) => {
      if (data) {
        setSettings({
          dailyGoal: data.dailyGoal,
          defaultCupSize: data.defaultCupSize,
          soundEnabled: data.soundEnabled
        });
        
        // Save to local storage
        saveSettings({
          dailyGoal: data.dailyGoal,
          defaultCupSize: data.defaultCupSize,
          soundEnabled: data.soundEnabled
        });
      }
    },
    onError: () => {
      // If API fails, load from local storage
      const savedSettings = loadSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    }
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<UserSettings>) => {
      return apiRequest("PATCH", "/api/settings", updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    }
  });
  
  // Handle daily goal increment
  const handleIncreaseGoal = () => {
    if (settings.dailyGoal < 5) {
      const newGoal = parseFloat((settings.dailyGoal + 0.1).toFixed(1));
      setSettings(prev => ({ ...prev, dailyGoal: newGoal }));
      updateSettingsMutation.mutate({ dailyGoal: newGoal });
      saveSettings({ ...settings, dailyGoal: newGoal });
    }
  };
  
  // Handle daily goal decrement
  const handleDecreaseGoal = () => {
    if (settings.dailyGoal > 0.5) {
      const newGoal = parseFloat((settings.dailyGoal - 0.1).toFixed(1));
      setSettings(prev => ({ ...prev, dailyGoal: newGoal }));
      updateSettingsMutation.mutate({ dailyGoal: newGoal });
      saveSettings({ ...settings, dailyGoal: newGoal });
    }
  };
  
  // Handle daily goal direct input
  const handleGoalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.5 && value <= 5) {
      setSettings(prev => ({ ...prev, dailyGoal: value }));
      updateSettingsMutation.mutate({ dailyGoal: value });
      saveSettings({ ...settings, dailyGoal: value });
    }
  };
  
  // Handle cup size change
  const handleCupSizeChange = (value: string) => {
    const size = parseInt(value);
    setSettings(prev => ({ ...prev, defaultCupSize: size }));
    updateSettingsMutation.mutate({ defaultCupSize: size });
    saveSettings({ ...settings, defaultCupSize: size });
  };
  
  // Handle sound toggle
  const handleSoundToggle = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
    updateSettingsMutation.mutate({ soundEnabled: enabled });
    saveSettings({ ...settings, soundEnabled: enabled });
  };
  
  // Handle reset data
  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all your hydration data?')) {
      try {
        await apiRequest("DELETE", "/api/water-intake", {});
        queryClient.invalidateQueries({ queryKey: ["/api/water-intake"] });
        toast({
          title: "Data reset",
          description: "Your hydration data has been reset",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <section className="mb-8">
      <h2 className="font-nunito font-bold text-xl text-[#333333] mb-4">Settings</h2>
      <Card className="bg-white rounded-lg shadow-md p-6">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h3 className="font-nunito font-medium text-lg mb-1">Daily Water Goal</h3>
              <p className="text-[#757575] text-sm">Set your daily hydration target</p>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={handleDecreaseGoal}
                className="bg-[#F5F8FA] hover:bg-[#E0E0E0] w-10 h-10 rounded-l-lg flex items-center justify-center border border-[#E0E0E0] border-r-0 text-[#333333]"
              >
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
                >
                  <path d="M5 12h14" />
                </svg>
              </Button>
              <Input 
                type="text" 
                value={settings.dailyGoal.toString()} 
                onChange={handleGoalInput}
                className="bg-[#F5F8FA] border-[#E0E0E0] w-16 h-10 text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#00BCD4] rounded-none"
              />
              <Button 
                onClick={handleIncreaseGoal}
                className="bg-[#F5F8FA] hover:bg-[#E0E0E0] w-10 h-10 rounded-r-lg flex items-center justify-center border border-[#E0E0E0] border-l-0 text-[#333333]"
              >
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
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Button>
              <span className="ml-2 text-[#757575]">L</span>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h3 className="font-nunito font-medium text-lg mb-1">Default Cup Size</h3>
                <p className="text-[#757575] text-sm">Set your preferred water serving size</p>
              </div>
              <div>
                <Select 
                  value={settings.defaultCupSize.toString()} 
                  onValueChange={handleCupSizeChange}
                >
                  <SelectTrigger className="bg-[#F5F8FA] border-[#E0E0E0] rounded-lg px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-[#00BCD4]">
                    <SelectValue placeholder="Select cup size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="200">200ml (Small Cup)</SelectItem>
                    <SelectItem value="350">350ml (Regular Cup)</SelectItem>
                    <SelectItem value="500">500ml (Large Cup)</SelectItem>
                    <SelectItem value="750">750ml (Water Bottle)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-nunito font-medium text-lg">Sound Effects</h3>
              <Switch 
                checked={settings.soundEnabled} 
                onCheckedChange={handleSoundToggle} 
                className="data-[state=checked]:bg-[#4CAF50]"
              />
            </div>
            <p className="text-[#757575] text-sm">Play a sound when notifications are displayed</p>
          </div>
          
          <div className="border-t border-[#E0E0E0] pt-6 mt-6">
            <Button 
              onClick={handleResetData}
              variant="ghost" 
              className="text-red-500 hover:text-red-700 font-medium transition-colors duration-200 flex items-center p-0"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-1"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
