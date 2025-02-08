
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemForm } from "./InventoryItemForm";

type AddInventoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddInventoryDialog({ open, onOpenChange }: AddInventoryDialogProps) {
  const handleSubmit = (values: any) => {
    console.log(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <InventoryItemForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
