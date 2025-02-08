
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

export function Combobox({ 
  items = [], 
  value = "", 
  onChange, 
  placeholder 
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Ensure items is always a valid array
  const safeItems = React.useMemo(() => {
    console.log('Combobox items:', items); // Debug log
    const itemsArray = Array.isArray(items) ? items : [];
    if (!searchQuery) return itemsArray;
    return itemsArray.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // Handle undefined or null value
  const selectedItem = React.useMemo(() => {
    console.log('Selected value:', value); // Debug log
    return safeItems.find((item) => item.value === value) || null;
  }, [safeItems, value]);

  // Don't render until we have valid items
  if (!Array.isArray(items)) {
    console.log('Invalid items prop:', items); // Debug log
    return null;
  }

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
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
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
                onSelect={(currentValue) => {
                  console.log('Item selected:', currentValue); // Debug log
                  onChange(currentValue === value ? "" : currentValue);
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
