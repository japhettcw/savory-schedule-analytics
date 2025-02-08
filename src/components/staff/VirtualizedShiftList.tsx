
import React from 'react';
import { FixedSizeList } from 'react-window';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface ShiftData {
  id: number;
  employeeName: string;
  position: string;
  start: Date;
  end: Date;
  notes: string;
}

interface VirtualizedShiftListProps {
  shifts: ShiftData[];
  onEdit: (shift: ShiftData) => void;
  onDelete: (id: number) => void;
}

const Row = React.memo(({ index, style, data }: any) => {
  const { shifts, onEdit, onDelete } = data;
  const shift = shifts[index];

  return (
    <TableRow style={style}>
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
            onClick={() => onEdit(shift)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(shift.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

Row.displayName = 'ShiftListRow';

export const VirtualizedShiftList = React.memo(({ shifts, onEdit, onDelete }: VirtualizedShiftListProps) => {
  const rowHeight = 52;
  const listHeight = Math.min(shifts.length * rowHeight, 400);

  return (
    <FixedSizeList
      height={listHeight}
      itemCount={shifts.length}
      itemSize={rowHeight}
      width="100%"
      itemData={{ shifts, onEdit, onDelete }}
    >
      {Row}
    </FixedSizeList>
  );
});

VirtualizedShiftList.displayName = 'VirtualizedShiftList';
