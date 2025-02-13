
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
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

interface Shift {
  id: number;
  employeeName: string;
  position: string;
  start: Date;
  end: Date;
  notes: string;
}

interface UpcomingShiftsTableProps {
  shifts: Shift[];
  onEdit: (shift: Shift) => void;
  onDelete: (id: number) => void;
}

export function UpcomingShiftsTable({ shifts, onEdit, onDelete }: UpcomingShiftsTableProps) {
  return (
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
                        onClick={() => onEdit(shift)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(shift.id)}
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
  );
}
