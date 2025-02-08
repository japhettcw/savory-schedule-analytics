
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface WastedItem {
  itemName: string;
  quantity: number;
  unit: string;
  costImpact: number;
  percentage: number;
}

interface MostWastedItemsReportProps {
  items: WastedItem[];
}

export function MostWastedItemsReport({ items }: MostWastedItemsReportProps) {
  const sortedItems = [...items].sort((a, b) => b.costImpact - a.costImpact);
  const top5Items = sortedItems.slice(0, 5);

  const totalWaste = items.reduce((sum, item) => sum + item.costImpact, 0);
  const top5Waste = top5Items.reduce((sum, item) => sum + item.costImpact, 0);
  const top5Percentage = (top5Waste / totalWaste) * 100;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Most Wasted Items</h2>
      
      {top5Percentage > 60 && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Waste Concentration</AlertTitle>
          <AlertDescription>
            Top 5 items account for {top5Percentage.toFixed(1)}% of total waste cost. 
            Consider reviewing inventory management for these items.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Cost Impact</TableHead>
              <TableHead>% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top5Items.map((item) => (
              <TableRow key={item.itemName}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell>${item.costImpact.toFixed(2)}</TableCell>
                <TableCell>{item.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
