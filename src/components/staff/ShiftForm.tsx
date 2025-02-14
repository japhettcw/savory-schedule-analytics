
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Shift } from "@/types/shifts";

interface ShiftFormProps {
  onSubmit: (values: Omit<Shift, "id">) => void;
  initialData?: Shift;
}

export function ShiftForm({ onSubmit, initialData }: ShiftFormProps) {
  const [formData, setFormData] = useState({
    employeeName: initialData?.employeeName || "",
    position: initialData?.position || "",
    start: initialData?.start ? new Date(initialData.start).toISOString().slice(0, 16) : "",
    end: initialData?.end ? new Date(initialData.end).toISOString().slice(0, 16) : "",
    notes: initialData?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeName: formData.employeeName,
      position: formData.position,
      start: new Date(formData.start),
      end: new Date(formData.end),
      notes: formData.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employeeName">Employee Name</Label>
        <Input
          id="employeeName"
          value={formData.employeeName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, employeeName: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, position: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="start">Start Time</Label>
        <Input
          id="start"
          type="datetime-local"
          value={formData.start}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, start: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end">End Time</Label>
        <Input
          id="end"
          type="datetime-local"
          value={formData.end}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, end: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "Update Shift" : "Add Shift"}
      </Button>
    </form>
  );
}
