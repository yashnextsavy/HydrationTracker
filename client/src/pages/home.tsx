import { useEffect } from "react";
import WaterGoalTracker from "@/components/water-goal-tracker";
import ReminderSettings from "@/components/reminder-settings";
import UserSettings from "@/components/user-settings";

export default function Home() {
  useEffect(() => {
    document.title = "HydroRemind - Stay Hydrated";
  }, []);

  return (
    <div className="bg-[#F5F8FA] min-h-screen">
      <div className="container max-w-3xl mx-auto p-4 md:p-6">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="36" 
              height="36" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-[#00BCD4] mr-2">
              <path d="M12 2v6m0 0s-3-2-3-4m3 4s3-2 3-4M4 9h16l-1.37 9.58a2 2 0 0 1-1.97 1.42H7.34a2 2 0 0 1-1.97-1.42L4 9z" />
              <path d="M7 14.5h10" />
            </svg>
            <h1 className="font-nunito font-bold text-3xl md:text-4xl text-[#333333]">HydroRemind</h1>
          </div>
          <p className="font-opensans text-[#757575]">Stay hydrated throughout your day</p>
        </header>

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
