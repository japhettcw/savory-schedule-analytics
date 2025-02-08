
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit of measurement is required"),
  supplier: z.string().min(2, "Supplier name must be at least 2 characters"),
  reorderPoint: z.number().min(0, "Reorder point must be positive"),
  expiryDate: z.string().optional(),
});

type InventoryItemFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: z.infer<typeof formSchema>;
  isSubmitting?: boolean;
};

export function InventoryItemForm({ onSubmit, initialData, isSubmitting = false }: InventoryItemFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      supplier: "",
      reorderPoint: 0,
      expiryDate: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Item Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  placeholder="Enter item name"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.name}
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="category">Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    id="category"
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.category}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="meat">Meat</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="dry-goods">Dry Goods</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="quantity">Quantity</FormLabel>
                <FormControl>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="1"
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.quantity}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="unit">Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      id="unit"
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.unit}
                    >
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="l">Liters (L)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="supplier">Supplier</FormLabel>
              <FormControl>
                <Input
                  id="supplier"
                  placeholder="Enter supplier name"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.supplier}
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reorderPoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="reorderPoint">Reorder Point</FormLabel>
              <FormControl>
                <Input
                  id="reorderPoint"
                  type="number"
                  min="0"
                  step="1"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.reorderPoint}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="expiryDate">Expiry Date (Optional)</FormLabel>
              <FormControl>
                <Input
                  id="expiryDate"
                  type="date"
                  aria-invalid={!!form.formState.errors.expiryDate}
                  {...field}
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit"
            className="hover-scale active-press"
            aria-label="Submit inventory item form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              initialData ? "Update Item" : "Add Item"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
