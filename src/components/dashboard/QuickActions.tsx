
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarIcon, FileTextIcon, ChartBarIcon, PlusIcon } from "lucide-react";

interface QuickActionsProps {
  userRole: string;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const actions = [
    {
      label: "Add Menu Item",
      icon: PlusIcon,
      onClick: () => console.log("Add menu item clicked"),
      roles: ["owner", "manager"],
    },
    {
      label: "Staff Schedule",
      icon: CalendarIcon,
      onClick: () => console.log("Staff schedule clicked"),
      roles: ["owner", "manager", "staff"],
    },
    {
      label: "View Reports",
      icon: ChartBarIcon,
      onClick: () => console.log("View reports clicked"),
      roles: ["owner", "manager"],
    },
    {
      label: "Daily Log",
      icon: FileTextIcon,
      onClick: () => console.log("Daily log clicked"),
      roles: ["owner", "manager", "staff"],
    },
  ];

  const filteredActions = actions.filter((action) =>
    action.roles.includes(userRole.toLowerCase())
  );

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
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
