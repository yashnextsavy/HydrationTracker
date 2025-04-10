import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, RefreshCw } from "lucide-react";

type HydrationTip = {
  id: number;
  tip: string;
  category: string;
};

export default function HydrationTips() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: tip, isLoading } = useQuery({
    queryKey: ['/api/hydration-tips/random', category, refreshKey],
    queryFn: () => getQueryFn<HydrationTip>({ on401: "throw" })(
      `/api/hydration-tips/random${category ? `?category=${category}` : ''}`
    )
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCategorySelect = (selectedCategory: string | undefined) => {
    if (category === selectedCategory) {
      setCategory(undefined);
    } else {
      setCategory(selectedCategory);
    }
    setRefreshKey(prev => prev + 1);
  };

  // Get a new tip every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'health':
        return "bg-[#E6F7F9] text-[#00BCD4] hover:bg-[#D0EFF2]";
      case 'habit':
        return "bg-[#E8F5E9] text-[#4CAF50] hover:bg-[#D7EAD8]";
      case 'general':
      default:
        return "bg-[#E3F2FD] text-[#2196F3] hover:bg-[#D0E8FC]";
    }
  };

  const getCategoryDisplayName = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-[#333333] flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-[#FFD700]" />
          Hydration Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          {['general', 'health', 'habit'].map((cat) => (
            <Button
              key={cat}
              variant="outline"
              size="sm"
              className={`text-xs ${category === cat ? getCategoryColor(cat) : 'bg-white border-[#E0E0E0] text-[#757575]'}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {getCategoryDisplayName(cat)}
            </Button>
          ))}
        </div>
        
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : tip ? (
          <div className="bg-[#F5F8FA] p-4 rounded-lg relative min-h-[120px]">
            <Badge 
              className={`absolute right-4 top-4 ${getCategoryColor(tip.category)}`}
            >
              {getCategoryDisplayName(tip.category)}
            </Badge>
            <div className="pr-16 mt-2">
              <p className="text-[#333333] text-lg">{tip.tip}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="absolute bottom-4 right-4 text-[#757575] hover:text-[#333333] hover:bg-[#E0E0E0]"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              New Tip
            </Button>
          </div>
        ) : (
          <div className="bg-[#F5F8FA] p-4 rounded-lg text-center">
            <p className="text-[#757575]">No tips available for this category</p>
          </div>
        )}
        
        <div className="mt-4 text-center text-sm text-[#757575]">
          <p>Tips refresh automatically every 2 minutes or when you choose a different category</p>
        </div>
      </CardContent>
    </Card>
  );
}