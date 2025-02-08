
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface PortionData {
  itemName: string;
  currentPortion: number;
  suggestedPortion: number;
  wastePercentage: number;
  unit: string;
}

interface PortionAdjustmentSuggestionProps {
  data: PortionData[];
}

export function PortionAdjustmentSuggestion({ data }: PortionAdjustmentSuggestionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Portion Adjustment Suggestions</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Current Portion</TableHead>
              <TableHead>Suggested Portion</TableHead>
              <TableHead>Waste %</TableHead>
              <TableHead>Adjustment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const difference = item.suggestedPortion - item.currentPortion;
              return (
                <TableRow key={item.itemName}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>
                    {item.currentPortion} {item.unit}
                  </TableCell>
                  <TableCell>
                    {item.suggestedPortion} {item.unit}
                  </TableCell>
                  <TableCell>{item.wastePercentage.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={difference < 0 ? "destructive" : "default"}
                      className="flex items-center gap-1"
                    >
                      {difference < 0 ? (
                        <ArrowDownIcon className="h-3 w-3" />
                      ) : (
                        <ArrowUpIcon className="h-3 w-3" />
                      )}
                      {Math.abs(difference)} {item.unit}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
