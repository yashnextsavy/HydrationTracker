import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { CalendarIcon, LineChart } from "lucide-react";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type WaterIntake = {
  id: number;
  userId: number;
  amount: number;
  timestamp: string;
};

type DailyTotal = {
  date: string;
  amount: number;
};

type WaterHistoryResponse = {
  intakes: WaterIntake[];
  dailyTotals: DailyTotal[];
};

export default function WaterHistory() {
  // Default to last 7 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/water-intake/history', startDate, endDate],
    queryFn: async () => {
      const queryFn = getQueryFn<WaterHistoryResponse>({ on401: "throw" });
      return queryFn('/api/water-intake/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      });
    },
    enabled: !!startDate && !!endDate
  });

  const handleLast7Days = () => {
    setStartDate(format(subDays(new Date(), 6), "yyyy-MM-dd"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleLast30Days = () => {
    setStartDate(format(subDays(new Date(), 29), "yyyy-MM-dd"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
  };
  
  const chartData = data?.dailyTotals.map((day) => ({
    date: format(new Date(day.date), "MMM d"),
    amount: parseFloat(day.amount.toFixed(1))
  })) || [];

  function dateRangeText() {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } catch (e) {
      return "Invalid date range";
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-[#333333]">Water Intake History</CardTitle>
            <CardDescription className="text-[#757575] mt-1 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" /> 
              {dateRangeText()}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleLast7Days} 
              variant="outline" 
              size="sm"
              className="text-xs bg-white border-[#E0E0E0] hover:bg-[#F5F8FA] text-[#333333]"
            >
              Last 7 Days
            </Button>
            <Button 
              onClick={handleLast30Days} 
              variant="outline" 
              size="sm"
              className="text-xs bg-white border-[#E0E0E0] hover:bg-[#F5F8FA] text-[#333333]"
            >
              Last 30 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full space-y-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#E53935]">
            <p>Failed to load water history data</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-[#757575]">
            <p>No water intake data for the selected period</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#757575', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#757575', fontSize: 12 }}
                  tickFormatter={(value) => `${value}L`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}L`, 'Water Intake']} 
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E0E0E0', padding: '8px 12px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  name="Water Intake (L)" 
                  stroke="#00BCD4" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#00BCD4' }} 
                  activeDot={{ r: 6, fill: '#00BCD4' }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4 text-center text-sm text-[#757575]">
          <p>Track your hydration over time to see patterns and improvements</p>
        </div>
      </CardContent>
    </Card>
  );
}