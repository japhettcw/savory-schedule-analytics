
import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddShiftDialog } from "@/components/staff/AddShiftDialog";
import { useToast } from "@/hooks/use-toast";
import { TimeOffRequestForm } from "@/components/staff/TimeOffRequestForm";
import { TimeOffApprovalDashboard } from "@/components/staff/TimeOffApprovalDashboard";
import { EmployeeAvailabilityForm } from "@/components/staff/EmployeeAvailabilityForm";
import { ShiftSwapRequestForm } from "@/components/staff/ShiftSwapRequestForm";
import { OpenShiftsBoard } from "@/components/staff/OpenShiftsBoard";
import { SchedulingAlerts } from "@/components/staff/SchedulingAlerts";
import { detectAllConflicts } from "@/services/ConflictDetectionService";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  const isMobile = useIsMobile();
  const [isFormsCollapsed, setIsFormsCollapsed] = useState(true);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Staff Scheduling</h1>
          <p className="text-muted-foreground mt-2">
            Manage employee shifts and schedules
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedShift(null);
            setIsDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2" />
          Add Shift
        </Button>
      </div>

      <SchedulingAlerts alerts={conflicts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 sm:p-6 overflow-hidden">
          <div className="h-[500px] sm:h-[600px]">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              defaultView={isMobile ? "day" : "week"}
              views={["month", "week", "day"]}
              tooltipAccessor={(event) => event.resource.notes}
              onSelectEvent={(event) => {
                setSelectedShift(event.resource);
                setIsDialogOpen(true);
              }}
              className="rounded-md touch-pan-y"
            />
          </div>
        </Card>

        {isMobile ? (
          <Collapsible
            open={!isFormsCollapsed}
            onOpenChange={setIsFormsCollapsed}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center justify-between"
              >
                <span>Forms & Requests</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    !isFormsCollapsed ? "transform rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <EmployeeAvailabilityForm />
              <TimeOffRequestForm />
              <ShiftSwapRequestForm />
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="space-y-6">
            <EmployeeAvailabilityForm />
            <TimeOffRequestForm />
            <ShiftSwapRequestForm />
          </div>
        )}
      </div>

      <OpenShiftsBoard />
      <TimeOffApprovalDashboard />

      <Card className="overflow-hidden">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Shifts</h2>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="hidden sm:table-cell">Position</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Start Time</TableHead>
                  <TableHead className="hidden sm:table-cell">End Time</TableHead>
                  <TableHead className="hidden lg:table-cell">Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">
                      {shift.employeeName}
                      <div className="sm:hidden text-sm text-muted-foreground">
                        {shift.position}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{shift.position}</TableCell>
                    <TableCell>
                      {format(shift.start, "PP")}
                      <div className="sm:hidden text-sm text-muted-foreground">
                        {format(shift.start, "p")} - {format(shift.end, "p")}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{format(shift.start, "p")}</TableCell>
                    <TableCell className="hidden sm:table-cell">{format(shift.end, "p")}</TableCell>
                    <TableCell className="hidden lg:table-cell">{shift.notes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedShift(shift);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteShift(shift.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {shifts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No shifts scheduled
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

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
