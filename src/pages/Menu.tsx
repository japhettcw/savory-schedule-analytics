import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddEditMenuDialog } from "@/components/menu/AddEditMenuDialog";
import VirtualizedMenuList from "@/components/menu/VirtualizedMenuList";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem } from "@/types/menu";
import { useMediaQuery } from "@/hooks/use-media-query";

const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    price: 12.99,
    category: "Main Course",
    description: "Juicy beef patty with fresh vegetables",
    image: "/placeholder.svg",
    available: true,
    stockLevel: 15,
    allergens: ["Milk", "Wheat"],
    ingredients: [
      { name: "Beef Patty", quantity: "200", unit: "g" },
      { name: "Burger Bun", quantity: "1", unit: "piece" },
    ],
  },
  {
    id: 2,
    name: "Caesar Salad",
    price: 9.99,
    category: "Starters",
    description: "Crisp romaine lettuce with Caesar dressing",
    image: "/placeholder.svg",
    available: true,
    allergens: ["Eggs", "Fish"],
    ingredients: [
      { name: "Romaine Lettuce", quantity: "150", unit: "g" },
      { name: "Caesar Dressing", quantity: "50", unit: "ml" },
    ],
  },
  {
    id: 3,
    name: "Margherita Pizza",
    price: 14.99,
    category: "Main Course",
    description: "Classic Italian pizza with tomato and mozzarella",
    image: "/placeholder.svg",
    available: true,
    allergens: ["Milk", "Wheat"],
    ingredients: [
      { name: "Pizza Dough", quantity: "250", unit: "g" },
      { name: "Mozzarella", quantity: "100", unit: "g" },
    ],
  },
];

const categories = [
  "All",
  "Starters",
  "Main Course",
  "Desserts",
  "Beverages",
  "Sides",
];

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();
  
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  
  const columnCount = useMemo(() => {
    if (isDesktop) return 3;
    if (isTablet) return 2;
    return 1;
  }, [isDesktop, isTablet]);

  const handleAddEditItem = useCallback((item: MenuItem) => {
    if (selectedItem) {
      setMenuItems(prev => prev.map(menuItem =>
        menuItem.id === item.id ? item : menuItem
      ));
    } else {
      setMenuItems(prev => [...prev, item]);
    }
  }, [selectedItem]);

  const handleDeleteItem = useCallback(() => {
    if (selectedItem) {
      setMenuItems(prev => prev.filter(item => item.id !== selectedItem.id));
      toast({
        title: "Menu item deleted",
        description: `${selectedItem.name} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedItem(undefined);
    }
  }, [selectedItem, toast]);

  const handleEditClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsAddEditDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const filteredItems = useMemo(() => menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [menuItems, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's menu items
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setSelectedItem(undefined);
            setIsAddEditDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-[500px]">
        <VirtualizedMenuList
          items={filteredItems}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          columnCount={columnCount}
        />
      </div>

      <AddEditMenuDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        item={selectedItem}
        onSave={handleAddEditItem}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
