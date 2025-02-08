
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const allergens = [
  "Milk",
  "Eggs",
  "Fish",
  "Shellfish",
  "Tree Nuts",
  "Peanuts",
  "Wheat",
  "Soy",
];

type AllergenSelectorProps = {
  selectedAllergens: string[];
  onChange: (allergens: string[]) => void;
};

export function AllergenSelector({ 
  selectedAllergens, 
  onChange 
}: AllergenSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleAllergen = (allergen: string) => {
    const newSelection = selectedAllergens.includes(allergen)
      ? selectedAllergens.filter((a) => a !== allergen)
      : [...selectedAllergens, allergen];
    onChange(newSelection);
  };

  const removeAllergen = (allergen: string) => {
    onChange(selectedAllergens.filter((a) => a !== allergen));
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            Select allergens
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search allergens..." />
            <CommandEmpty>No allergen found.</CommandEmpty>
            <CommandGroup>
              {allergens.map((allergen) => (
                <CommandItem
                  key={allergen}
                  onSelect={() => toggleAllergen(allergen)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAllergens.includes(allergen)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {allergen}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2">
        {selectedAllergens.map((allergen) => (
          <Badge
            key={allergen}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {allergen}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => removeAllergen(allergen)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
