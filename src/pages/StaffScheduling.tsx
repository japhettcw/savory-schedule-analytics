
import { useState, useEffect } from "react";
import { AddShiftDialog } from "@/components/staff/AddShiftDialog";
import { useToast } from "@/hooks/use-toast";
import { TimeOffApprovalDashboard } from "@/components/staff/TimeOffApprovalDashboard";
import { EmployeeAvailabilityForm } from "@/components/staff/EmployeeAvailabilityForm";
import { OpenShiftsBoard } from "@/components/staff/OpenShiftsBoard";
import { SchedulingAlerts } from "@/components/staff/SchedulingAlerts";
import { detectAllConflicts } from "@/services/ConflictDetectionService";
import { Card } from "@/components/ui/card";
import { SchedulingHeader } from "@/components/staff/SchedulingHeader";
import { SchedulingCalendar } from "@/components/staff/SchedulingCalendar";
import { StaffActions } from "@/components/staff/StaffActions";
import { UpcomingShiftsTable } from "@/components/staff/UpcomingShiftsTable";

const mockShifts = [
  {
    id: 1,
    employeeName: "John Doe",
    position: "Chef",
    start: new Date(2024, 2, 20, 9, 0),
    end: new Date(2024, 2, 20, 17, 0),
    notes: "Morning shift",
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    position: "Server",
    start: new Date(2024, 2, 21, 12, 0),
    end: new Date(2024, 2, 21, 20, 0),
    notes: "Evening shift",
  },
];

export default function StaffScheduling() {
  const [shifts, setShifts] = useState(mockShifts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<typeof mockShifts[0] | null>(null);
  const [conflicts, setConflicts] = useState(detectAllConflicts(mockShifts));
  const { toast } = useToast();

  useEffect(() => {
    const newConflicts = detectAllConflicts(shifts);
    setConflicts(newConflicts);
  }, [shifts]);

  const handleAddShift = (shiftData: {
    employeeName: string;
    position: string;
    start: Date;
    end: Date;
    notes?: string;
  }) => {
    const newShift = {
      id: Math.max(0, ...shifts.map((s) => s.id)) + 1,
      ...shiftData,
      notes: shiftData.notes || "",
    };
    setShifts([...shifts, newShift]);
    toast({
      title: "Shift added",
      description: "The shift has been successfully added to the schedule.",
    });
  };

  const handleEditShift = (shiftData: {
    employeeName: string;
    position: string;
    start: Date;
    end: Date;
    notes?: string;
  }) => {
    if (!selectedShift) return;
    
    const updatedShifts = shifts.map((shift) =>
      shift.id === selectedShift.id ? { 
        ...shift, 
        ...shiftData,
        notes: shiftData.notes || "",
      } : shift
    );
    setShifts(updatedShifts);
    setSelectedShift(null);
    toast({
      title: "Shift updated",
      description: "The shift has been successfully updated.",
    });
  };

  const handleDeleteShift = (id: number) => {
    setShifts(shifts.filter((shift) => shift.id !== id));
    toast({
      title: "Shift deleted",
      description: "The shift has been successfully removed from the schedule.",
    });
  };

  const calendarEvents = shifts.map((shift) => ({
    title: `${shift.employeeName} (${shift.position})`,
    start: shift.start,
    end: shift.end,
    resource: shift,
  }));

  return (
    <div className="space-y-6">
      <SchedulingHeader 
        onAddShift={() => {
          setSelectedShift(null);
          setIsDialogOpen(true);
        }}
      />

      <SchedulingAlerts alerts={conflicts} />

      <SchedulingCalendar
        events={calendarEvents}
        onSelectEvent={(event) => {
          setSelectedShift(event.resource);
          setIsDialogOpen(true);
        }}
      />

      <Card className="p-4 sm:p-6">
        <EmployeeAvailabilityForm />
      </Card>

      <StaffActions />

      <OpenShiftsBoard />
      <TimeOffApprovalDashboard />

      <UpcomingShiftsTable
        shifts={shifts}
        onEdit={(shift) => {
          setSelectedShift(shift);
          setIsDialogOpen(true);
        }}
        onDelete={handleDeleteShift}
      />

      <AddShiftDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedShift(null);
        }}
        onSubmit={selectedShift ? handleEditShift : handleAddShift}
        initialData={selectedShift || undefined}
      />
    </div>
  );
}
