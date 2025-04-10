import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loadWaterIntake, saveWaterIntake } from "@/lib/localStorageUtils";
import { Settings, WaterIntake } from "@shared/schema";

type WaterStats = {
  totalIntake: number;
  dailyGoal: number;
};

export default function WaterGoalTracker() {
  const [stats, setStats] = useState<WaterStats>({
    totalIntake: 0,
    dailyGoal: 2.5,
  });
  
  // Fetch settings and water intake
  const { data: settingsData } = useQuery<{ dailyGoal: number }>({
    queryKey: ["/api/settings"]
  });
  
  // Update stats when settings data changes
  useEffect(() => {
    if (settingsData?.dailyGoal) {
      setStats(prev => ({ ...prev, dailyGoal: settingsData.dailyGoal }));
    }
  }, [settingsData]);
  
  const { data: waterData, isLoading } = useQuery<{ totalIntake: number, intakes: any[] }>({
    queryKey: ["/api/water-intake"]
  });
  
  // Update stats when water data changes
  useEffect(() => {
    if (waterData?.totalIntake !== undefined) {
      saveWaterIntake(waterData.totalIntake);
      setStats(prev => ({ ...prev, totalIntake: waterData.totalIntake }));
    }
  }, [waterData]);
  
  // Fallback to local storage if API calls fail
  useEffect(() => {
    const savedIntake = loadWaterIntake();
    if (savedIntake !== null && !waterData) {
      setStats(prev => ({ ...prev, totalIntake: savedIntake }));
    }
  }, [waterData]);
  
  // Add water mutation
  const addWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      return apiRequest("POST", "/api/water-intake", { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake"] });
    },
  });
  

  
  // Calculate progress
  const progress = Math.min(100, (stats.totalIntake / stats.dailyGoal) * 100);
  const remaining = Math.max(0, parseFloat((stats.dailyGoal - stats.totalIntake).toFixed(1)));
  
  // Handle adding water
  const handleAddWater = (amount: number) => {
    addWaterMutation.mutate(amount);
    
    // Optimistic update
    setStats(prev => ({
      ...prev,
      totalIntake: Math.min(prev.dailyGoal, parseFloat((prev.totalIntake + amount).toFixed(1)))
    }));
    
    // Save to local storage
    saveWaterIntake(Math.min(stats.dailyGoal, stats.totalIntake + amount));
  };
  
  return (
    <section className="mb-8">
      <Card className="bg-white rounded-lg shadow-md p-6 mb-4 relative overflow-hidden">
        <CardContent className="p-0">
          {/* Water level visualization */}
          <div className="relative z-10 flex flex-col items-center justify-center mb-6" style={{ minHeight: "150px" }}>
            <div 
              className="absolute bottom-0 left-0 right-0 bg-[#00BCD4] transition-all duration-500 ease-in-out rounded-b-lg z-0"
              style={{ height: `${progress}%` }}
            >
              <div className="absolute top-0 left-0 right-0 h-4 transform -translate-y-full">
                <svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path 
                    d="M0,10 C30,4 70,4 100,10 L100,0 L0,0 Z" 
                    fill="rgba(0, 188, 212, 0.3)"
                  />
                </svg>
              </div>
            </div>
            
            <div className="relative z-10 mb-2">
              <span className="font-nunito font-bold text-5xl">{stats.totalIntake.toFixed(1)}</span>
              <span className="font-nunito font-bold text-3xl text-[#757575]">/{stats.dailyGoal}L</span>
            </div>
            
            <p className="font-opensans text-[#757575] z-10 mb-4">{Math.round(progress)}% of daily goal</p>
            
            <div className="mt-4 z-10">
              <Button 
                onClick={() => handleAddWater(0.35)}
                className="bg-[#00BCD4] hover:bg-[#2196F3] text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 flex items-center shadow-sm"
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Water
              </Button>
            </div>
          </div>

          {/* Quick add buttons */}
          <div className="grid grid-cols-3 gap-2 mt-2 z-10 relative">
            <Button 
              variant="outline" 
              onClick={() => handleAddWater(0.2)}
              className="border-[#00BCD4] text-[#00BCD4] hover:bg-[#00BCD4] hover:text-white"
            >
              +200ml
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddWater(0.35)}
              className="border-[#00BCD4] text-[#00BCD4] hover:bg-[#00BCD4] hover:text-white"
            >
              +350ml
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleAddWater(0.5)}
              className="border-[#00BCD4] text-[#00BCD4] hover:bg-[#00BCD4] hover:text-white"
            >
              +500ml
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Daily stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-[#757575] text-sm">Remaining</p>
          <p className="font-nunito font-bold text-xl text-[#333333]">{remaining}L</p>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-[#757575] text-sm">Goal</p>
          <p className="font-nunito font-bold text-xl text-[#333333]">{stats.dailyGoal}L</p>
        </Card>
        <Card className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-[#757575] text-sm">Progress</p>
          <p className="font-nunito font-bold text-xl text-[#333333]">{Math.round(progress)}%</p>
        </Card>
      </div>
    </section>
  );
}
