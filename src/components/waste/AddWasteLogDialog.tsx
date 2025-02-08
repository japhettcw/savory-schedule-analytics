
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WasteLogForm, type WasteLogFormData } from "./WasteLogForm";
import type { WasteLog } from "./WasteLogList";

interface AddWasteLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WasteLog) => void;
  initialData?: WasteLog | null;
}

export function AddWasteLogDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AddWasteLogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Waste Log" : "Add Waste Log"}
          </DialogTitle>
        </DialogHeader>
        <WasteLogForm
          onSubmit={onSubmit}
          initialData={initialData as WasteLogFormData}
        />
      </DialogContent>
    </Dialog>
  );
}
