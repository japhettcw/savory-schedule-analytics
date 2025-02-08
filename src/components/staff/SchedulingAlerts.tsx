
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { ConflictAlert } from "@/services/ConflictDetectionService";
import { format } from "date-fns";

interface SchedulingAlertsProps {
  alerts: ConflictAlert[];
}

export function SchedulingAlerts({ alerts }: SchedulingAlertsProps) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.severity === 'error' ? "destructive" : "default"}
        >
          {alert.severity === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {alert.type === 'overlap' && "Shift Overlap Detected"}
            {alert.type === 'staffing' && "Staffing Level Issue"}
            {alert.type === 'break' && "Break Time Required"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {alert.message}
            {alert.shifts && alert.shifts.length > 0 && (
              <div className="mt-2 text-sm">
                {alert.shifts.map((shift) => (
                  <div key={shift.id} className="text-muted-foreground">
                    {format(shift.start, "PPp")} - {format(shift.end, "p")}
                  </div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
