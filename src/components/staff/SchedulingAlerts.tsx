
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
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";

interface SchedulingAlertsProps {
  alerts: ConflictAlert[];
}

export function SchedulingAlerts({ alerts }: SchedulingAlertsProps) {
  const [isStaffingDialogOpen, setIsStaffingDialogOpen] = useState(false);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  // Memoize the filtered alerts to prevent unnecessary re-renders
  const staffingAlerts = alerts.filter(alert => alert.type === 'staffing');
  const otherAlerts = alerts.filter(alert => alert.type !== 'staffing');

  // Debug mount/unmount
  useEffect(() => {
    console.log('SchedulingAlerts mounted');
    return () => console.log('SchedulingAlerts unmounted');
  }, []);

  // Monitor dialog state changes
  useEffect(() => {
    console.log('Dialog state changed:', isStaffingDialogOpen);
  }, [isStaffingDialogOpen]);

  // Monitor alerts data
  useEffect(() => {
    console.log('Staffing alerts count:', staffingAlerts.length);
    if (staffingAlerts.length > 0) {
      setIsContentLoaded(true);
    }
  }, [staffingAlerts]);

  // Memoized click handler to prevent recreating on every render
  const handleStaffingAlertClick = useCallback(() => {
    console.log('Staffing alert clicked');
    try {
      // Force update DOM before opening modal
      requestAnimationFrame(() => {
        setIsStaffingDialogOpen(true);
        console.log('Dialog state set to open');
      });
    } catch (error) {
      console.error('Error opening staffing dialog:', error);
    }
  }, []);

  // Safety check for alerts
  if (!alerts || !Array.isArray(alerts)) {
    console.error('Invalid alerts data:', alerts);
    return null;
  }

  if (!alerts.length) return null;

  return (
    <div className="relative isolate">
      <div className="space-y-4">
        {staffingAlerts.length > 0 && (
          <Alert
            variant="default"
            className="cursor-pointer hover:bg-accent transition-colors relative z-10"
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

      {isContentLoaded && (
        <Dialog 
          open={isStaffingDialogOpen} 
          onOpenChange={(open) => {
            console.log('Dialog onOpenChange:', open);
            setIsStaffingDialogOpen(open);
          }}
        >
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 z-[998] bg-black/80" />
            <DialogContent className="fixed left-[50%] top-[50%] z-[999] w-[95vw] max-w-lg -translate-x-[50%] -translate-y-[50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
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
          </DialogPortal>
        </Dialog>
      )}
    </div>
  );
}
