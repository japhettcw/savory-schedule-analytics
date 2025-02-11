
import { useState } from "react";
import type { MenuItem } from "@/types/menu";
import { useMenuItems } from "@/hooks/use-menu-items";
import { MenuItemManager } from "@/components/menu/MenuItemManager";
import { FilteredMenuItems } from "@/components/menu/FilteredMenuItems";

export default function Menu() {
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const {
    menuItems,
    isLoading,
    error,
    handleAddEditItem,
    handleDeleteItem,
  } = useMenuItems();

  const handleEditClick = (item: MenuItem) => {
    console.log('Edit clicked for item:', item);
    setSelectedItem(item);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteClick = (item: MenuItem) => {
    console.log('Delete clicked for item:', item);
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (item: MenuItem) => {
    handleAddEditItem(item);
    setIsAddEditDialogOpen(false);
    setSelectedItem(undefined);
  };

  const handleDelete = () => {
    if (selectedItem) {
      handleDeleteItem(selectedItem.id);
      setIsDeleteDialogOpen(false);
      setSelectedItem(undefined);
    }
  };

  if (isLoading) {
    return <div>Loading menu items...</div>;
  }

  if (error) {
    return <div>Error loading menu items: {error.toString()}</div>;
  }

  return (
    <div className="container mx-auto px-4 space-y-8 max-w-7xl">
      <MenuItemManager
        selectedItem={selectedItem}
        isAddEditDialogOpen={isAddEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onAddNewClick={() => {
          setSelectedItem(undefined);
          setIsAddEditDialogOpen(true);
        }}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onAddEditDialogChange={setIsAddEditDialogOpen}
        onDeleteDialogChange={setIsDeleteDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <FilteredMenuItems
        items={menuItems}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
    </div>
  );
}
