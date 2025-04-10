import { useEffect } from "react";
import WaterGoalTracker from "@/components/water-goal-tracker";
import ReminderSettings from "@/components/reminder-settings";
import UserSettings from "@/components/user-settings";
import UserHeader from "@/components/user-header";

export default function Home() {
  useEffect(() => {
    document.title = "HydroRemind - Stay Hydrated";
  }, []);

  return (
    <div className="bg-[#F5F8FA] min-h-screen">
      <UserHeader />
      
      <div className="container max-w-3xl mx-auto p-4 md:p-6 pt-8">
        <main>
          <WaterGoalTracker />
          <ReminderSettings />
          <UserSettings />
        </main>

        <footer className="text-center text-[#757575] text-sm py-4">
          <p>HydroRemind &copy; {new Date().getFullYear()} - Stay hydrated!</p>
        </footer>
      </div>
    </div>
  );
}
