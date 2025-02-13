
import { Badge } from "@/components/ui/badge";
import { FeatureTooltip } from "@/components/ui/feature-tooltip";
import { StockChecker } from "./StockChecker";
import type { MenuItem } from "@/types/menu";

interface ItemDetailsProps {
  item: MenuItem;
}

export function ItemDetails({ item }: ItemDetailsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="text-sm text-muted-foreground">{item.category}</p>
      {item.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {item.description}
        </p>
      )}
      <div className="mt-2">
        <FeatureTooltip content="Current stock level status">
          <StockChecker stockLevel={item.stockLevel} />
        </FeatureTooltip>
      </div>
      {item.allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          <FeatureTooltip 
            content="Food allergens that customers should be aware of"
            showIcon={false}
          >
            {item.allergens.map((allergen) => (
              <Badge key={allergen} variant="outline">
                {allergen}
              </Badge>
            ))}
          </FeatureTooltip>
        </div>
      )}
      {item.ingredients.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          <FeatureTooltip content="Recipe ingredients and quantities">
            <p className="font-medium">Ingredients:</p>
          </FeatureTooltip>
          <ul className="list-disc list-inside">
            {item.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.variations && item.variations.length > 0 && (
        <div className="mt-2">
          <FeatureTooltip content="Available size and price variations">
            <p className="text-sm font-medium">Variations:</p>
          </FeatureTooltip>
          <div className="space-y-1 mt-1">
            {item.variations.map((variation) => (
              <div key={variation.id} className="text-sm flex justify-between">
                <span>{variation.name}</span>
                <span className="font-medium">${variation.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
