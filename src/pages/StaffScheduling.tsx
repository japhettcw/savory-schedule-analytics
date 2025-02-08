
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

// Mock data for initial development
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
  const { toast } = useToast();

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
      notes: shiftData.notes || "", // Provide default empty string for notes
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
        notes: shiftData.notes || "", // Provide default empty string for notes
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <div className="space-y-8">
          <EmployeeAvailabilityForm />
          <TimeOffRequestForm />
        </div>
      </div>

      <TimeOffApprovalDashboard />

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
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>{shift.employeeName}</TableCell>
                    <TableCell>{shift.position}</TableCell>
                    <TableCell>{format(shift.start, "PP")}</TableCell>
                    <TableCell>{format(shift.start, "p")}</TableCell>
                    <TableCell>{format(shift.end, "p")}</TableCell>
                    <TableCell>{shift.notes}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
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
                          onClick={() => handleDeleteShift(shift.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
