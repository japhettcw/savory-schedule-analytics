
import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddShiftDialog } from "@/components/staff/AddShiftDialog";
import { useToast } from "@/hooks/use-toast";
import { TimeOffRequestForm } from "@/components/staff/TimeOffRequestForm";
import { TimeOffApprovalDashboard } from "@/components/staff/TimeOffApprovalDashboard";
import { EmployeeAvailabilityForm } from "@/components/staff/EmployeeAvailabilityForm";
import { ShiftSwapRequestForm } from "@/components/staff/ShiftSwapRequestForm";
import { OpenShiftsBoard } from "@/components/staff/OpenShiftsBoard";
import { SchedulingAlerts } from "@/components/staff/SchedulingAlerts";
import { VirtualizedShiftList } from "@/components/staff/VirtualizedShiftList";
import { detectAllConflicts } from "@/services/ConflictDetectionService";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Staff Scheduling</h1>
          <p className="text-muted-foreground mt-2">
            Manage employee shifts and schedules
          </p>
        </div>
        <Button onClick={() => {
          setSelectedShift(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2" />
          Add Shift
        </Button>
      </div>

      <SchedulingAlerts alerts={conflicts} />

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="requests">Requests & Availability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-8">
          <Card className="p-6">
            <div className="h-[600px]">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={["month", "week", "day"]}
                tooltipAccessor={(event) => event.resource.notes}
                onSelectEvent={(event) => {
                  setSelectedShift(event.resource);
                  setIsDialogOpen(true);
                }}
                className="rounded-md"
              />
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Shifts</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <VirtualizedShiftList
                      shifts={shifts}
                      onEdit={(shift) => {
                        setSelectedShift(shift);
                        setIsDialogOpen(true);
                      }}
                      onDelete={handleDeleteShift}
                    />
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          <OpenShiftsBoard />
        </TabsContent>

        <TabsContent value="requests" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EmployeeAvailabilityForm />
            <TimeOffRequestForm />
            <ShiftSwapRequestForm />
          </div>
          <TimeOffApprovalDashboard />
        </TabsContent>
      </Tabs>

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
