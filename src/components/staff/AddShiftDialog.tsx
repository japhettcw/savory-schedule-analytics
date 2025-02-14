
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShiftForm } from "./ShiftForm";
import type { Shift } from "@/types/shifts";

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<Shift, "id">) => void;
  initialData?: Shift;
}

export function AddShiftDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AddShiftDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] !mt-0 !block sm:max-w-[425px] overflow-y-auto max-h-[85vh] z-[9999]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Shift" : "Add New Shift"}
          </DialogTitle>
        </DialogHeader>
        <ShiftForm onSubmit={onSubmit} initialData={initialData} />
      </DialogContent>
    </Dialog>
  );
}
