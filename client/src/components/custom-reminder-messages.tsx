import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Plus, Trash, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReminderMessage = {
  id: number;
  userId: number;
  message: string;
  isActive: boolean;
};

export default function CustomReminderMessages() {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/reminder-messages'],
    queryFn: () => getQueryFn<ReminderMessage[]>({ on401: "throw" })('/api/reminder-messages')
  });

  const createMutation = useMutation({
    mutationFn: (message: string) => apiRequest('/api/reminder-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminder-messages'] });
      setNewMessage("");
      setIsAdding(false);
      toast({
        title: "Message Added",
        description: "Your custom reminder message has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Adding Message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, message, isActive }: { id: number, message?: string, isActive?: boolean }) => apiRequest(`/api/reminder-messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, isActive })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminder-messages'] });
      setEditingId(null);
      toast({
        title: "Message Updated",
        description: "Your reminder message has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/reminder-messages/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminder-messages'] });
      toast({
        title: "Message Deleted",
        description: "Your reminder message has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message.",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate(newMessage);
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, isActive: !isActive });
  };

  const handleStartEdit = (message: ReminderMessage) => {
    setEditingId(message.id);
    setEditMessage(message.message);
  };

  const handleSaveEdit = (id: number) => {
    if (!editMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message.",
        variant: "destructive"
      });
      return;
    }
    updateMutation.mutate({ id, message: editMessage });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    // Ask for confirmation
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-[#333333] flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-[#00BCD4]" />
          Custom Reminder Messages
        </CardTitle>
        <CardDescription className="text-[#757575]">
          Create personalized messages for your hydration reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {messages && messages.map((message) => (
              <div key={message.id} className="flex items-center p-3 bg-[#F5F8FA] rounded-lg border border-[#E0E0E0]">
                <Switch 
                  checked={message.isActive}
                  onCheckedChange={() => handleToggleActive(message.id, message.isActive)}
                  className="mr-3"
                />
                
                <div className="flex-1">
                  {editingId === message.id ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className="bg-white"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleSaveEdit(message.id)}
                        disabled={updateMutation.isPending}
                        className="h-9 w-9 shrink-0"
                      >
                        <Save className="h-4 w-4 text-[#00BCD4]" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleCancelEdit}
                        className="h-9 w-9 shrink-0"
                      >
                        <X className="h-4 w-4 text-[#757575]" />
                      </Button>
                    </div>
                  ) : (
                    <p className={`${!message.isActive ? "text-[#9E9E9E]" : "text-[#333333]"}`}>
                      {message.message}
                    </p>
                  )}
                </div>
                
                {editingId !== message.id && (
                  <div className="flex space-x-1 ml-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleStartEdit(message)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4 text-[#757575]" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDelete(message.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8"
                    >
                      <Trash className="h-4 w-4 text-[#E53935]" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            {isAdding ? (
              <div className="flex items-center p-3 bg-[#F5F8FA] rounded-lg border border-[#E0E0E0]">
                <div className="flex-1">
                  <Input 
                    placeholder="Type your reminder message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="flex space-x-2 ml-3">
                  <Button 
                    onClick={handleAddMessage}
                    disabled={createMutation.isPending}
                    className="bg-[#00BCD4] hover:bg-[#00ACC1] text-white"
                  >
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAdding(false);
                      setNewMessage("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsAdding(true)}
                className="w-full border-dashed border-2 border-[#00BCD4] text-[#00BCD4] hover:bg-[#E6F7F9]"
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Message
              </Button>
            )}
          </div>
        )}
        
        <div className="mt-4 text-sm text-[#757575]">
          <p>These messages will be randomly selected when sending hydration reminders</p>
        </div>
      </CardContent>
    </Card>
  );
}