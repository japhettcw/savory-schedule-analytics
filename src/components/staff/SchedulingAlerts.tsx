
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
import { useState } from "react";

interface SchedulingAlertsProps {
  alerts: ConflictAlert[];
}

export function SchedulingAlerts({ alerts }: SchedulingAlertsProps) {
  const [isStaffingDialogOpen, setIsStaffingDialogOpen] = useState(false);
  
  if (!alerts.length) return null;

  const staffingAlerts = alerts.filter(alert => alert.type === 'staffing');
  const otherAlerts = alerts.filter(alert => alert.type !== 'staffing');

  return (
    <>
      <div className="space-y-4">
        {staffingAlerts.length > 0 && (
          <Alert
            variant="default"
            className="cursor-pointer"
            onClick={() => setIsStaffingDialogOpen(true)}
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

      <Dialog open={isStaffingDialogOpen} onOpenChange={setIsStaffingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Staffing Level Issues</DialogTitle>
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
