
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AllergenSelector } from "./AllergenSelector";
import { IngredientList } from "./IngredientList";
import { VariationsList } from "./VariationsList";
import { FormValues } from "./MenuItemFormSchema";
import type { Ingredient, MenuItemVariation } from "@/types/menu";

type MenuItemAdditionalDetailsProps = {
  form: UseFormReturn<FormValues>;
};

export function MenuItemAdditionalDetails({ form }: MenuItemAdditionalDetailsProps) {
  return (
    <>
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

      <FormField
        control={form.control}
        name="variations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Variations</FormLabel>
            <FormControl>
              <VariationsList
                variations={field.value as MenuItemVariation[]}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
