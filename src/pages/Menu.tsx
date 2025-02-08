
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
};

const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    price: 12.99,
    category: "Main Course",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Caesar Salad",
    price: 9.99,
    category: "Starters",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Margherita Pizza",
    price: 14.99,
    category: "Main Course",
    image: "/placeholder.svg",
  },
];

export default function Menu() {
  const [menuItems] = useState<MenuItem[]>(initialMenuItems);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's menu items
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                </div>
                <span className="text-lg font-bold">${item.price}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
