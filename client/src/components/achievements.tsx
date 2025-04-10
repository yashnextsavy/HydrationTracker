import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Achievement = {
  id: number;
  userId: number;
  name: string;
  description: string;
  achieved: boolean;
  achievedDate: string | null;
  type: string;
  thresholdValue: number;
};

type Streak = {
  id: number;
  userId: number;
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
};

export default function AchievementsComponent() {
  const [activeTab, setActiveTab] = useState("achievements");

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: () => getQueryFn<Achievement[]>({ on401: "throw" })('/api/achievements')
  });

  const { data: streak, isLoading: streakLoading } = useQuery({
    queryKey: ['/api/streaks'],
    queryFn: () => getQueryFn<Streak>({ on401: "throw" })('/api/streaks')
  });

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-[#333333] flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-[#FFD700]" />
          Achievements & Streaks
        </CardTitle>
        <CardDescription className="text-[#757575]">
          Track your hydration accomplishments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="achievements" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger
              value="achievements"
              className={`w-1/2 ${activeTab === "achievements" ? "bg-[#00BCD4] text-white" : ""}`}
            >
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="streaks"
              className={`w-1/2 ${activeTab === "streaks" ? "bg-[#00BCD4] text-white" : ""}`}
            >
              Streaks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements">
            {achievementsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : achievements && achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center p-3 rounded-lg ${
                      achievement.achieved 
                        ? "bg-[#E6F7F9] border-2 border-[#00BCD4]" 
                        : "bg-[#F5F5F5] border border-[#E0E0E0]"
                    }`}
                  >
                    <div className={`p-2 rounded-full mr-3 flex items-center justify-center ${
                      achievement.achieved ? "bg-[#00BCD4]" : "bg-[#BDBDBD]"
                    }`}>
                      <Trophy className={`h-5 w-5 ${achievement.achieved ? "text-white" : "text-[#757575]"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#333333]">{achievement.name}</h4>
                        {achievement.achieved ? (
                          <Badge variant="secondary" className="bg-[#00BCD4] text-white">
                            Achieved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-[#BDBDBD] text-[#757575]">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#757575]">{achievement.description}</p>
                      {achievement.achieved && achievement.achievedDate && (
                        <p className="text-xs text-[#9E9E9E] mt-1">
                          Achieved {formatDistanceToNow(new Date(achievement.achievedDate), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#757575]">
                <p>No achievements found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="streaks">
            {streakLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : streak ? (
              <div className="space-y-4">
                <div className="bg-[#E6F7F9] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#00BCD4] p-3 rounded-full mr-3">
                      <Flame className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#333333]">Current Streak</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-[#00BCD4]">{streak.currentStreak}</span>
                        <span className="text-md text-[#757575] ml-1">days</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#757575] mt-2">
                    Days in a row you've met your water goal
                  </p>
                </div>
                
                <div className="bg-[#F5F8FA] p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#2196F3] p-3 rounded-full mr-3">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#333333]">Longest Streak</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-[#2196F3]">{streak.longestStreak}</span>
                        <span className="text-md text-[#757575] ml-1">days</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#757575] mt-2">
                    Your best streak so far
                  </p>
                </div>
                
                <div className="text-center pt-2">
                  <p className="text-sm text-[#757575] flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Last updated: {new Date(streak.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-[#757575]">
                <p>No streak data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}