
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus } from "lucide-react";
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
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2" />
          Add Shift
        </Button>
      </div>

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AddShiftDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
