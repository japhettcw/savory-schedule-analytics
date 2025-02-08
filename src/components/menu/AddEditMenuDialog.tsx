
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Image } from "lucide-react";
import { AllergenSelector } from "./AllergenSelector";
import { IngredientList, type Ingredient } from "./IngredientList";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
}).strict();

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  allergens: z.array(z.string()),
  ingredients: z.array(ingredientSchema),
}).strict();

type FormValues = z.infer<typeof formSchema>;

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image: string;
  available?: boolean;
  allergens: string[];
  ingredients: Ingredient[];
};

type AddEditMenuDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem;
  onSave: (data: MenuItem) => void;
};

const categories = [
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
  "Sides",
];

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
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: FormValues) => {
    const newItem: MenuItem = {
      id: item?.id || Date.now(),
      name: values.name,
      price: parseFloat(values.price),
      category: values.category,
      description: values.description,
      image: imagePreview,
      available: true,
      allergens: values.allergens,
      ingredients: values.ingredients as Ingredient[],
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Menu Item" : "Add New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Menu item preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100"
                >
                  <Image className="h-4 w-4" />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter item description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergens</FormLabel>
                  <FormControl>
                    <AllergenSelector
                      selectedAllergens={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <IngredientList
                      ingredients={field.value as Ingredient[]}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {item ? "Update" : "Add"} Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
