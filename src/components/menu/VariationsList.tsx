
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import type { MenuItemVariation } from "@/types/menu";

interface VariationsListProps {
  variations: MenuItemVariation[];
  onChange: (variations: MenuItemVariation[]) => void;
}

export function VariationsList({ variations, onChange }: VariationsListProps) {
  const [newVariation, setNewVariation] = useState({ name: "", price: 0 });

  const handleAdd = () => {
    if (newVariation.name && newVariation.price > 0) {
      onChange([...variations, { ...newVariation, id: crypto.randomUUID() }]);
      setNewVariation({ name: "", price: 0 });
    }
  };

  const handleRemove = (id: string) => {
    onChange(variations.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Variation name"
          value={newVariation.name}
          onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Price"
          value={newVariation.price || ""}
          onChange={(e) => setNewVariation({ ...newVariation, price: parseFloat(e.target.value) || 0 })}
          className="w-32"
        />
        <Button type="button" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {variations.map((variation) => (
          <div key={variation.id} className="flex items-center gap-4">
            <span className="flex-1">{variation.name}</span>
            <span className="w-32 text-right">${variation.price.toFixed(2)}</span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemove(variation.id)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
