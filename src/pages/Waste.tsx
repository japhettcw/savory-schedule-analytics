
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddWasteLogDialog } from "@/components/waste/AddWasteLogDialog";

// Temporary mock data until we integrate with Supabase
const wasteData = [
  {
    id: 1,
    itemName: "Tomato Soup",
    quantityWasted: 2.5,
    date: "2024-03-15",
    reason: "Expired",
    costImpact: 25.0,
  },
  {
    id: 2,
    itemName: "Chicken Breast",
    quantityWasted: 1.8,
    date: "2024-03-14",
    reason: "Overproduction",
    costImpact: 18.0,
  },
];

const analyticsData = [
  { name: "Mon", waste: 45 },
  { name: "Tue", waste: 30 },
  { name: "Wed", waste: 25 },
  { name: "Thu", waste: 40 },
  { name: "Fri", waste: 35 },
  { name: "Sat", waste: 50 },
  { name: "Sun", waste: 42 },
];

export default function Waste() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalWasteCost = wasteData.reduce(
    (sum, item) => sum + item.costImpact,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Waste Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and analyze food waste in your restaurant
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2" />
          Log Waste
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Total Waste Logs</h3>
          <p className="text-3xl font-bold">{wasteData.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">This Week's Cost Impact</h3>
          <p className="text-3xl font-bold">${totalWasteCost.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-2">Most Common Reason</h3>
          <p className="text-3xl font-bold">Expired</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Waste Trend</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="waste" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Waste Logs</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity (kg)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Cost Impact ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>{item.quantityWasted}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>${item.costImpact.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <AddWasteLogDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
