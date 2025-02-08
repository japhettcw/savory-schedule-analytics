
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

interface InventoryItem {
  id: string;
  name: string;
}

export function AddWasteLogDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AddWasteLogDialogProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        return;
      }

      setInventoryItems(data?.map(item => ({
        label: item.name,
        value: item.id
      })) || []);
    };

    fetchInventoryItems();
  }, []);

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
          inventoryItems={inventoryItems}
        />
      </DialogContent>
    </Dialog>
  );
}
