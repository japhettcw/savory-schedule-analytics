
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Users } from "lucide-react";
import { ConflictAlert } from "@/services/ConflictDetectionService";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface SchedulingAlertsProps {
  alerts: ConflictAlert[];
}

export function SchedulingAlerts({ alerts }: SchedulingAlertsProps) {
  const [isStaffingDialogOpen, setIsStaffingDialogOpen] = useState(false);
  const staffingAlerts = alerts.filter(alert => alert.type === 'staffing');
  const otherAlerts = alerts.filter(alert => alert.type !== 'staffing');

  // Force re-render when alerts change
  useEffect(() => {
    if (staffingAlerts.length > 0) {
      console.log('Staffing alerts available:', staffingAlerts.length);
    }
  }, [staffingAlerts]);

  // Aggressive click handler
  const handleStaffingAlertClick = () => {
    console.log('Staffing alert clicked');
    try {
      setIsStaffingDialogOpen(true);
      console.log('Dialog state set to open');
    } catch (error) {
      console.error('Error opening staffing dialog:', error);
    }
  };

  if (!alerts.length) return null;

  return (
    <>
      <div className="space-y-4">
        {staffingAlerts.length > 0 && (
          <Alert
            variant="default"
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={handleStaffingAlertClick}
          >
            <Users className="h-4 w-4" />
            <AlertTitle>Staffing Level Issues</AlertTitle>
            <AlertDescription>
              {staffingAlerts.length} staffing level {staffingAlerts.length === 1 ? 'issue' : 'issues'} detected. Click to view details.
            </AlertDescription>
          </Alert>
        )}

        {otherAlerts.map((alert) => (
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

      <Dialog 
        open={isStaffingDialogOpen} 
        onOpenChange={setIsStaffingDialogOpen}
      >
        <DialogContent className="fixed left-1/2 top-1/2 z-[9999] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Staffing Level Issues</DialogTitle>
            <DialogDescription>
              The following staffing level issues have been detected:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {staffingAlerts.map((alert) => (
              <div key={alert.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  {alert.severity === 'error' ? (
                    <AlertCircle className="h-4 w-4 mt-1 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mt-1 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    {alert.shifts && alert.shifts.length > 0 && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {alert.shifts.map((shift) => (
                          <div key={shift.id}>
                            {format(shift.start, "PPp")} - {format(shift.end, "p")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
