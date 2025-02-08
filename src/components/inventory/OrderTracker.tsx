
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageSearch } from "lucide-react";

type Order = {
  id: string;
  supplier: string;
  items: Array<{ name: string; quantity: number }>;
  status: "pending" | "shipped" | "delivered";
  expectedDelivery: string;
};

// Mock data - replace with actual data when integrating with backend
const orderData: Order[] = [
  {
    id: "PO-001",
    supplier: "Fresh Produce Co",
    items: [
      { name: "Tomatoes", quantity: 50 },
      { name: "Lettuce", quantity: 30 },
    ],
    status: "shipped",
    expectedDelivery: "2024-03-20",
  },
  {
    id: "PO-002",
    supplier: "Quality Meats Inc",
    items: [{ name: "Chicken Breast", quantity: 25 }],
    status: "pending",
    expectedDelivery: "2024-03-22",
  },
];

export function OrderTracker() {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "shipped":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <PackageSearch className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Incoming Shipments</h2>
      </div>
      <div className="space-y-4">
        {orderData.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">Order {order.id}</h3>
                <Badge variant="outline" className="capitalize">
                  {order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {order.supplier}
              </p>
              <ul className="text-sm">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-right">
              <p className="text-muted-foreground">Expected Delivery</p>
              <p>{order.expectedDelivery}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
