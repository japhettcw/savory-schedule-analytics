
import { useMemo } from "react";
import type { MenuItem } from "@/types/menu";
import VirtualizedMenuList from "@/components/menu/VirtualizedMenuList";
import { MenuControls } from "@/components/menu/MenuControls";

interface FilteredMenuItemsProps {
  items: MenuItem[];
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function FilteredMenuItems({
  items,
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onEdit,
  onDelete,
}: FilteredMenuItemsProps) {
  const filteredItems = useMemo(() => {
    console.log('Filtering items:', { items, searchTerm, selectedCategory });
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <MenuControls
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      <div className="min-h-[500px]">
        {filteredItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No menu items found
          </div>
        ) : (
          <VirtualizedMenuList
            items={filteredItems}
            onEdit={onEdit}
            onDelete={onDelete}
            columnCount={1}
          />
        )}
      </div>
    </div>
  );
}
