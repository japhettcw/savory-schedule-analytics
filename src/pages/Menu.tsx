
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Ingredient } from "@/components/menu/IngredientList";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image: string;
  available?: boolean;
  allergens: string[];
  ingredients: Ingredient[];
};

const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    price: 12.99,
    category: "Main Course",
    description: "Juicy beef patty with fresh vegetables",
    image: "/placeholder.svg",
    available: true,
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

  const handleAddEditItem = (item: MenuItem) => {
    if (selectedItem) {
      setMenuItems(
        menuItems.map((menuItem) =>
          menuItem.id === item.id ? item : menuItem
        )
      );
    } else {
      setMenuItems([...menuItems, item]);
    }
  };

  const handleDeleteItem = () => {
    if (selectedItem) {
      setMenuItems(menuItems.filter((item) => item.id !== selectedItem.id));
      toast({
        title: "Menu item deleted",
        description: `${selectedItem.name} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedItem(undefined);
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                  {item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.allergens.map((allergen) => (
                        <Badge key={allergen} variant="outline">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.ingredients.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p className="font-medium">Ingredients:</p>
                      <ul className="list-disc list-inside">
                        {item.ingredients.map((ingredient, index) => (
                          <li key={index}>
                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(item)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(item)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
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
