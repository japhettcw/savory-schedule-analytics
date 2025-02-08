
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";

interface OpenShift {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  position: string;
  requirements: string;
}

// Mock data - replace with actual data from your backend
const initialOpenShifts: OpenShift[] = [
  {
    id: "1",
    date: new Date(2024, 2, 25),
    startTime: new Date(2024, 2, 25, 8, 0),
    endTime: new Date(2024, 2, 25, 16, 0),
    position: "Server",
    requirements: "Experience with POS systems",
  },
  {
    id: "2",
    date: new Date(2024, 2, 26),
    startTime: new Date(2024, 2, 26, 16, 0),
    endTime: new Date(2024, 2, 26, 0, 0),
    position: "Bartender",
    requirements: "Mixology certification required",
  },
];

export function OpenShiftsBoard() {
  const [openShifts, setOpenShifts] = useState<OpenShift[]>(initialOpenShifts);
  const { toast } = useToast();

  const handleClaimShift = (shiftId: string) => {
    // Here you would typically call your backend to claim the shift
    setOpenShifts(openShifts.filter(shift => shift.id !== shiftId));
    toast({
      title: "Shift claimed",
      description: "Your request to claim this shift has been submitted for approval.",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Open Shifts</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {openShifts.length} shifts available
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openShifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{format(shift.date, "PP")}</TableCell>
                <TableCell>
                  {format(shift.startTime, "p")} - {format(shift.endTime, "p")}
                </TableCell>
                <TableCell>{shift.position}</TableCell>
                <TableCell>{shift.requirements}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClaimShift(shift.id)}
                  >
                    Claim Shift
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {openShifts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No open shifts available at this time
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
