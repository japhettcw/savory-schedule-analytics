
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "./ImageUploader";
import { calculateSuggestedPrice } from "@/utils/priceCalculator";
import type { MenuItem, Ingredient, MenuItemVariation } from "@/types/menu";
import { FormValues, formSchema } from "./MenuItemFormSchema";
import { MenuItemBasicDetails } from "./MenuItemBasicDetails";
import { MenuItemAdditionalDetails } from "./MenuItemAdditionalDetails";

type AddEditMenuDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem;
  onSave: (data: MenuItem) => void;
};

export function AddEditMenuDialog({ 
  open, 
  onOpenChange, 
  item, 
  onSave 
}: AddEditMenuDialogProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>(
    item?.image || "/placeholder.svg"
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      price: item?.price?.toString() || "",
      category: item?.category || "",
      description: item?.description || "",
      allergens: item?.allergens || [],
      ingredients: (item?.ingredients || []).map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit
      })),
      stockLevel: item?.stockLevel?.toString() || "0",
      variations: item?.variations || [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: item?.name || "",
        price: item?.price?.toString() || "",
        category: item?.category || "",
        description: item?.description || "",
        allergens: item?.allergens || [],
        ingredients: (item?.ingredients || []).map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        stockLevel: item?.stockLevel?.toString() || "0",
        variations: item?.variations || [],
      });
      setImagePreview(item?.image || "/placeholder.svg");
    }
  }, [form, item, open]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const watchIngredients = form.watch("ingredients") as Ingredient[];
  const suggestedPrice = calculateSuggestedPrice(watchIngredients);

  const onSubmit = (values: FormValues) => {
    const newItem: MenuItem = {
      id: item?.id || crypto.randomUUID(),
      name: values.name,
      price: parseFloat(values.price),
      category: values.category,
      description: values.description,
      image: imagePreview,
      available: true,
      allergens: values.allergens,
      ingredients: values.ingredients as Ingredient[],
      stockLevel: parseInt(values.stockLevel),
      variations: values.variations as MenuItemVariation[],
    };

    onSave(newItem);
    toast({
      title: item ? "Menu item updated" : "Menu item added",
      description: `${values.name} has been ${item ? "updated" : "added"} successfully.`,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !top-[50vh] !left-1/2 !-translate-x-1/2 w-[90vw] sm:max-w-[600px] h-[85vh] flex flex-col bg-background">
        <DialogDescription className="sr-only">
          {item ? "Edit menu item form" : "Add new menu item form"}
        </DialogDescription>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {item ? "Edit Menu Item" : "Add New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2"
          >
            <div className="flex items-center justify-center mb-6">
              <ImageUploader
                imageUrl={imagePreview}
                onImageUpload={handleImageUpload}
                className="hover:shadow-lg transition-shadow"
              />
            </div>

            <MenuItemBasicDetails form={form} suggestedPrice={suggestedPrice} />
            <MenuItemAdditionalDetails form={form} />
          </form>
        </Form>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {item ? "Update" : "Add"} Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
