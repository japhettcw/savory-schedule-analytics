
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

export type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
};

type IngredientListProps = {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
};

export function IngredientList({ 
  ingredients, 
  onChange 
}: IngredientListProps) {
  const [newIngredient, setNewIngredient] = useState<Ingredient>({
    name: "",
    quantity: "",
    unit: "",
  });

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && newIngredient.unit) {
      onChange([...ingredients, newIngredient]);
      setNewIngredient({ name: "", quantity: "", unit: "" });
    }
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-muted p-2 rounded-md"
          >
            <span>
              {ingredient.quantity} {ingredient.unit} {ingredient.name}
            </span>
            <X
              className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => removeIngredient(index)}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ingredient name"
          value={newIngredient.name}
          onChange={(e) =>
            setNewIngredient({ ...newIngredient, name: e.target.value })
          }
        />
        <Input
          type="number"
          placeholder="Quantity"
          className="w-24"
          value={newIngredient.quantity}
          onChange={(e) =>
            setNewIngredient({ ...newIngredient, quantity: e.target.value })
          }
        />
        <Input
          placeholder="Unit"
          className="w-24"
          value={newIngredient.unit}
          onChange={(e) =>
            setNewIngredient({ ...newIngredient, unit: e.target.value })
          }
        />
        <Button
          type="button"
          variant="outline"
          onClick={addIngredient}
          disabled={
            !newIngredient.name || !newIngredient.quantity || !newIngredient.unit
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
