
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemForm } from "./InventoryItemForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

type AddInventoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddInventoryDialog({ open, onOpenChange }: AddInventoryDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      console.log('Attempting to save inventory item:', values);

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: values.name,
          sku: values.sku || `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          category: values.category,
          quantity: values.quantity,
          unit: values.unit,
          supplier: values.supplier,
          reorder_point: values.reorderPoint,
          expiry_date: values.expiryDate || null,
          unit_price: values.unitPrice || 0,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving inventory item:', error);
        throw error;
      }

      console.log('Successfully saved inventory item:', data);

      toast({
        title: "Success",
        description: "Inventory item has been added successfully",
        duration: 3000,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900" id="add-inventory-title">
            Add Inventory Item
          </DialogTitle>
        </DialogHeader>
        <InventoryItemForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
