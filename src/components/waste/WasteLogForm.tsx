
import { Button } from "@/components/ui/button";
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
import { Combobox } from "@/components/ui/combobox";

const inventoryItems = [
  { label: "Tomato Soup", value: "tomato-soup" },
  { label: "Chicken Breast", value: "chicken-breast" },
  { label: "Rice", value: "rice" },
  { label: "Pasta", value: "pasta" },
] satisfies Array<{ label: string; value: string }>;

const wasteReasons = [
  { label: "Spoiled", value: "spoiled" },
  { label: "Over-Prepared", value: "over-prepared" },
  { label: "Expired", value: "expired" },
  { label: "Customer Return", value: "customer-return" },
  { label: "Other", value: "other" },
] as const;

const formSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  reason: z.string().min(1, "Reason is required"),
  date: z.string().min(1, "Date is required"),
  costImpact: z.number().min(0, "Cost impact must be 0 or greater"),
  notes: z.string().optional(),
});

export type WasteLogFormData = z.infer<typeof formSchema>;

interface WasteLogFormProps {
  onSubmit: (data: WasteLogFormData) => void;
  initialData?: WasteLogFormData;
}

export function WasteLogForm({ onSubmit, initialData }: WasteLogFormProps) {
  const form = useForm<WasteLogFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: initialData?.itemName ?? "",
      quantity: initialData?.quantity ?? 0,
      unit: initialData?.unit ?? "kg",
      reason: initialData?.reason ?? "",
      date: initialData?.date ?? new Date().toISOString().split("T")[0],
      costImpact: initialData?.costImpact ?? 0,
      notes: initialData?.notes ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Combobox
                  items={inventoryItems}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select or type item name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {wasteReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="costImpact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Impact ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Add any additional notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            {initialData ? "Update Waste Log" : "Add Waste Log"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
