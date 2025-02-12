
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CalendarIcon, 
  FileTextIcon, 
  ChartBarIcon, 
  PlusIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const actions = [
    {
      label: "Add Menu Item",
      icon: PlusIcon,
      onClick: () => navigate("/menu"),
      path: "/menu"
    },
    {
      label: "Staff Schedule",
      icon: CalendarIcon,
      onClick: () => navigate("/staff"),
      path: "/staff"
    },
    {
      label: "View Reports",
      icon: ChartBarIcon,
      onClick: () => {
        navigate("/reports");
      },
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
      path: null
    },
  ];

  return (
    <Card className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex flex-col items-center justify-center gap-2 h-auto py-4 hover:bg-accent/50 transition-colors"
            onClick={() => {
              console.log(`Clicking ${action.label} button`);
              action.onClick();
            }}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-sm text-center">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
