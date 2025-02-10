
import { useState } from "react";
import { Bell, BellDot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'error';
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Tomatoes inventory is running low (2 kg remaining)',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'warning',
    },
    {
      id: '2',
      title: 'New Order',
      message: 'Table 5 has placed a new order',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      read: false,
      type: 'info',
    },
  ]);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    toast({
      description: "Notification marked as read",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      description: "All notifications marked as read",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          aria-label={`Notifications - ${unreadCount} unread`}
        >
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-white border shadow-lg !z-[1000]"
        sideOffset={5}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs hover:bg-gray-100"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto bg-white">
          {notifications.length === 0 ? (
            <div className="px-4 py-2 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start px-4 py-2 cursor-pointer hover:bg-gray-100",
                  !notification.read && "bg-muted/50"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
