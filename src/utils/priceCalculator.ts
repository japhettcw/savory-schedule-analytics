
import type { Ingredient } from "@/types/menu";

// Mock ingredient costs - in a real app, these would come from your inventory system
const INGREDIENT_COSTS: Record<string, number> = {
  "Beef Patty": 5.00,
  "Burger Bun": 0.50,
  "Lettuce": 0.25,
  "Tomato": 0.30,
  // Add more ingredients as needed
};

export const calculateSuggestedPrice = (ingredients: Ingredient[]): number => {
  const totalCost = ingredients.reduce((sum, ingredient) => {
    const unitCost = INGREDIENT_COSTS[ingredient.name] || 0;
    const quantity = parseFloat(ingredient.quantity) || 0;
    return sum + (unitCost * quantity);
  }, 0);

  // Add 40% markup
  const suggestedPrice = totalCost * 1.4;
  return Math.ceil(suggestedPrice * 100) / 100; // Round up to nearest cent
};
