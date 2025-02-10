
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'error';
}

interface DashboardAlertsProps {
  alerts?: DashboardAlert[];
}

export function DashboardAlerts({ alerts = [] }: DashboardAlertsProps) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.type === 'error' ? "destructive" : "default"}
          className="border-l-4 border-l-orange-500"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
