
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface ComboboxProps {
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Combobox({ items = [], value = "", onChange, placeholder }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Ensure items is always an array and filter based on search query
  const safeItems = React.useMemo(() => {
    const itemsArray = Array.isArray(items) ? items : [];
    if (!searchQuery) return itemsArray;
    return itemsArray.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const selectedItem = safeItems.find((item) => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem ? selectedItem.label : placeholder || "Select item..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={placeholder || "Search items..."} 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup>
            {safeItems.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  onChange(item.value === value ? "" : item.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
