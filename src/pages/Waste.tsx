
import { useState } from "react";
import { WasteTrendChart } from "@/components/waste/WasteTrendChart";
import { WasteLogList } from "@/components/waste/WasteLogList";
import { WasteLogForm } from "@/components/waste/WasteLogForm";
import type { WasteLog } from "@/components/waste/WasteLogList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialWasteData: WasteLog[] = [
  {
    id: 1,
    itemName: "Tomato Soup",
    quantity: 2.5,
    unit: "kg",
    date: new Date().toISOString().split('T')[0],
    reason: "expired",
    costImpact: 25.0,
    notes: "Found during weekly inventory check",
  },
  {
    id: 2,
    itemName: "Chicken Breast",
    quantity: 1.8,
    unit: "kg",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    reason: "over-prepared",
    costImpact: 18.0,
    notes: "Overestimated dinner service needs",
  },
  {
    id: 3,
    itemName: "Mixed Vegetables",
    quantity: 3.2,
    unit: "kg",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    reason: "spoiled",
    costImpact: 12.5,
    notes: "Refrigeration issue",
  },
];

const Waste = () => {
  const [logs, setLogs] = useState<WasteLog[]>(initialWasteData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WasteLog | null>(null);

  const handleAddLog = (data: Omit<WasteLog, "id">) => {
    const newLog: WasteLog = {
      ...data,
      id: logs.length + 1,
    };
    setLogs([...logs, newLog]);
    setIsDialogOpen(false);
  };

  const handleEditLog = (data: WasteLog) => {
    setLogs(logs.map((log) => (log.id === data.id ? data : log)));
    setIsDialogOpen(false);
    setEditingLog(null);
  };

  const handleDeleteLog = (id: number) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const weeklyData = logs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .map((log) => ({
      name: log.date,
      waste: log.quantity,
      cost: log.costImpact,
    }))
    .reverse();

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Waste Management</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Add Waste Log</Button>
      </div>

      <WasteTrendChart data={weeklyData} />

      <WasteLogList
        logs={logs}
        onEdit={(log) => {
          setEditingLog(log);
          setIsDialogOpen(true);
        }}
        onDelete={handleDeleteLog}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLog ? "Edit Waste Log" : "Add Waste Log"}
            </DialogTitle>
          </DialogHeader>
          <WasteLogForm
            onSubmit={editingLog ? handleEditLog : handleAddLog}
            initialData={editingLog || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Waste;
