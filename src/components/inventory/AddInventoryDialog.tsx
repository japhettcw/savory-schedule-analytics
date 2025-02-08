
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemForm } from "./InventoryItemForm";
import { useToast } from "@/hooks/use-toast";

type AddInventoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddInventoryDialog({ open, onOpenChange }: AddInventoryDialogProps) {
  const { toast } = useToast();

  const handleSubmit = (values: any) => {
    // Handle form submission
    console.log(values);
    toast({
      title: "Success",
      description: "Inventory item has been added successfully",
      duration: 3000,
      role: "status",
      "aria-live": "polite",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-labelledby="add-inventory-title"
      >
        <DialogHeader>
          <DialogTitle id="add-inventory-title">Add Inventory Item</DialogTitle>
        </DialogHeader>
        <InventoryItemForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
