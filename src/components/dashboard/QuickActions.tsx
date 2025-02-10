
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CalendarIcon, 
  FileTextIcon, 
  ChartBarIcon, 
  PlusIcon,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/hooks/use-role-guard";

interface QuickActionsProps {
  userRole: AppRole;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const actions = [
    {
      label: "Add Menu Item",
      icon: PlusIcon,
      onClick: () => navigate("/menu"),
      roles: ["owner", "manager"] as AppRole[],
      path: "/menu"
    },
    {
      label: "Staff Schedule",
      icon: CalendarIcon,
      onClick: () => navigate("/staff"),
      roles: ["owner", "manager", "staff"] as AppRole[],
      path: "/staff"
    },
    {
      label: "View Reports",
      icon: ChartBarIcon,
      onClick: () => {
        if (!["owner", "manager"].includes(userRole)) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view reports",
            variant: "destructive",
          });
          return;
        }
        navigate("/reports");
      },
      roles: ["owner", "manager"] as AppRole[],
      path: "/reports"
    },
    {
      label: "Daily Log",
      icon: FileTextIcon,
      onClick: () => {
        toast({
          title: "Coming Soon",
          description: "Daily log feature will be available soon",
        });
      },
      roles: ["owner", "manager", "staff"] as AppRole[],
      path: null
    },
  ];

  const filteredActions = actions.filter((action) =>
    action.roles.includes(userRole)
  );

  return (
    <Card className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        {filteredActions.length === 0 && (
          <div className="flex items-center text-muted-foreground text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            No available actions
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {filteredActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex flex-col items-center justify-center gap-2 h-auto py-4 hover:bg-accent/50 transition-colors"
            onClick={action.onClick}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-sm text-center">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
