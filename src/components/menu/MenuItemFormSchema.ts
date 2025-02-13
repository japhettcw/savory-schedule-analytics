
import * as z from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
});

export const variationSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Variation name is required"),
  price: z.number().min(0, "Price must be a positive number"),
});

export const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  allergens: z.array(z.string()),
  ingredients: z.array(ingredientSchema),
  stockLevel: z.string().regex(/^\d+$/, "Stock level must be a positive number"),
  variations: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Variation name is required"),
    price: z.number().min(0, "Price must be a positive number"),
  })),
});

export type FormValues = z.infer<typeof formSchema>;

export const categories = [
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
  "Sides",
];
