
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

export interface WasteLog {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
  costImpact: number;
  notes?: string;
}

interface WasteLogListProps {
  logs: WasteLog[];
  onEdit: (log: WasteLog) => void;
  onDelete: (id: number) => void;
}

export function WasteLogList({ logs, onEdit, onDelete }: WasteLogListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof WasteLog>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch = log.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesReason = reasonFilter === "all" || log.reason === reasonFilter;
      return matchesSearch && matchesReason;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction * aValue.localeCompare(bValue);
      }
      return direction * (Number(aValue) - Number(bValue));
    });

  const handleSort = (field: keyof WasteLog) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Filter by reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            <SelectItem value="spoiled">Spoiled</SelectItem>
            <SelectItem value="over-prepared">Over-Prepared</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="customer-return">Customer Return</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("itemName")}
              >
                Item Name
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("quantity")}
              >
                Quantity
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("reason")}
              >
                Reason
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Date
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("costImpact")}
              >
                Cost Impact ($)
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.itemName}</TableCell>
                <TableCell>
                  {log.quantity} {log.unit}
                </TableCell>
                <TableCell className="capitalize">{log.reason}</TableCell>
                <TableCell>{log.date}</TableCell>
                <TableCell>${log.costImpact.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(log)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(log.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
