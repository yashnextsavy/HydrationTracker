import { useEffect, useState } from "react";
import WaterGoalTracker from "@/components/water-goal-tracker";
import ReminderSettings from "@/components/reminder-settings";
import UserSettings from "@/components/user-settings";
import UserHeader from "@/components/user-header";
import WaterHistory from "@/components/water-history";
import AchievementsComponent from "@/components/achievements";
import CustomReminderMessages from "@/components/custom-reminder-messages";
import HydrationTips from "@/components/hydration-tips";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Award, MessageCircle, Droplets, Settings } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    document.title = "HydroRemind - Stay Hydrated";
  }, []);

  return (
    <div className="bg-[#F5F8FA] min-h-screen">
      <UserHeader />
      
      <div className="container max-w-4xl mx-auto p-4 md:p-6 pt-8">
        <Tabs defaultValue="dashboard" onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border border-[#E0E0E0] p-1 rounded-lg">
            <TabsTrigger value="dashboard" className={`flex items-center ${activeTab === "dashboard" ? "bg-[#00BCD4] text-white" : ""}`}>
              <Droplets className="h-4 w-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className={`flex items-center ${activeTab === "history" ? "bg-[#00BCD4] text-white" : ""}`}>
              <CalendarDays className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="achievements" className={`flex items-center ${activeTab === "achievements" ? "bg-[#00BCD4] text-white" : ""}`}>
              <Award className="h-4 w-4 mr-1" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="messages" className={`flex items-center ${activeTab === "messages" ? "bg-[#00BCD4] text-white" : ""}`}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="settings" className={`flex items-center ${activeTab === "settings" ? "bg-[#00BCD4] text-white" : ""}`}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <main>
            <TabsContent value="dashboard">
              <WaterGoalTracker />
              <HydrationTips />
            </TabsContent>
            
            <TabsContent value="history">
              <WaterHistory />
            </TabsContent>
            
            <TabsContent value="achievements">
              <AchievementsComponent />
            </TabsContent>
            
            <TabsContent value="messages">
              <CustomReminderMessages />
            </TabsContent>
            
            <TabsContent value="settings">
              <ReminderSettings />
              <UserSettings />
            </TabsContent>
          </main>
        </Tabs>

        <footer className="text-center text-[#757575] text-sm py-4">
          <p>HydroRemind &copy; {new Date().getFullYear()} - Stay hydrated!</p>
        </footer>
      </div>
    </div>
  );
}
