
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WasteLogForm, type WasteLogFormData } from "./WasteLogForm";
import type { WasteLog } from "./WasteLogList";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface AddWasteLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WasteLog) => void;
  initialData?: WasteLog | null;
}

interface ComboboxItem {
  label: string;
  value: string;
}

export function AddWasteLogDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AddWasteLogDialogProps) {
  const [inventoryItems, setInventoryItems] = useState<ComboboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('inventory_items')
          .select('id, name');
        
        if (error) {
          console.error('Error fetching inventory items:', error);
          return;
        }

        const formattedItems = data?.map(item => ({
          label: item.name,
          value: item.id
        })) || [];

        setInventoryItems(formattedItems);
      } catch (error) {
        console.error('Error in fetchInventoryItems:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchInventoryItems();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-[9999] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg" style={{ position: 'fixed', margin: 'auto' }}>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Waste Log" : "Add Waste Log"}
          </DialogTitle>
        </DialogHeader>
        <WasteLogForm
          onSubmit={onSubmit}
          initialData={initialData as WasteLogFormData}
          inventoryItems={inventoryItems}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
