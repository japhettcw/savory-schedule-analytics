import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PackageSearch, Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

type OrderStatus = "pending" | "shipped" | "delivered";

type PurchaseOrder = {
  id: string;
  supplier_id: string;
  supplier: {
    name: string;
  };
  status: OrderStatus;
  expected_delivery: string;
  notes: string | null;
  items: Array<{
    id: string;
    inventory_item: {
      name: string;
    };
    quantity: number;
  }>;
};

export function OrderTracker() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [inventoryItems, setInventoryItems] = useState<Array<{ id: string; name: string }>>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [orderItems, setOrderItems] = useState<Array<{ itemId: string; quantity: number }>>([]);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          supplier_id,
          supplier:suppliers(name),
          status,
          expected_delivery,
          notes,
          items:purchase_order_items(
            id,
            inventory_item:inventory_items(name),
            quantity
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the status to ensure it matches OrderStatus
      const typedData = data?.map(order => ({
        ...order,
        status: order.status as OrderStatus
      })) || [];
      
      setOrders(typedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    }
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      return;
    }
    setSuppliers(data || []);
  };

  const fetchInventoryItems = async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching inventory items:', error);
      return;
    }
    setInventoryItems(data || []);
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchInventoryItems();
  }, []);

  useRealtimeSync({
    tableName: 'purchase_orders',
    onDataChange: fetchOrders,
  });

  const getStatusColor = (status: PurchaseOrder["status"]) => {
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const status = formData.get('status');
      // Validate status before proceeding
      if (status !== 'pending' && status !== 'shipped' && status !== 'delivered') {
        throw new Error('Invalid status');
      }

      const orderData = {
        supplier_id: formData.get('supplier_id') as string,
        status: status as OrderStatus,
        expected_delivery: formData.get('expected_delivery') as string,
        notes: formData.get('notes') as string | null,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (!orderData.user_id) {
        throw new Error('User not authenticated');
      }

      let orderId;
      if (editingOrder) {
        const { error } = await supabase
          .from('purchase_orders')
          .update(orderData)
          .eq('id', editingOrder.id);
        
        if (error) throw error;
        orderId = editingOrder.id;
      } else {
        const { data, error } = await supabase
          .from('purchase_orders')
          .insert([orderData])
          .select('id')
          .single();
        
        if (error) throw error;
        orderId = data.id;
      }

      // Handle order items
      if (editingOrder) {
        // Delete existing items
        await supabase
          .from('purchase_order_items')
          .delete()
          .eq('purchase_order_id', orderId);
      }

      // Insert new items
      const orderItemsData = orderItems.map(item => ({
        purchase_order_id: orderId,
        inventory_item_id: item.itemId,
        quantity: item.quantity,
      }));

      if (orderItemsData.length > 0) {
        const { error } = await supabase
          .from('purchase_order_items')
          .insert(orderItemsData);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: editingOrder ? "Order updated successfully" : "Order created successfully",
      });

      setIsDialogOpen(false);
      setEditingOrder(null);
      setOrderItems([]);
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { itemId: "", quantity: 1 }]);
  };

  const handleItemChange = (index: number, field: 'itemId' | 'quantity', value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PackageSearch className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Incoming Shipments</h2>
        </div>
        <Button onClick={() => {
          setEditingOrder(null);
          setOrderItems([]);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Create New Order
        </Button>
      </div>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">Order #{order.id.split('-')[0]}</h3>
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingOrder(order);
                    setOrderItems(order.items.map(item => ({
                      itemId: item.id,
                      quantity: item.quantity,
                    })));
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {order.supplier?.name}
              </p>
              <ul className="text-sm">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.inventory_item?.name} x {item.quantity}
                  </li>
                ))}
              </ul>
              {order.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  Note: {order.notes}
                </p>
              )}
            </div>
            <div className="text-sm text-right">
              <p className="text-muted-foreground">Expected Delivery</p>
              <p>{new Date(order.expected_delivery).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="fixed left-[50%] top-[50%] z-[9999] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg" style={{ position: 'fixed', margin: 'auto' }}>
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Order' : 'Create New Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier</Label>
              <Select name="supplier_id" defaultValue={editingOrder?.supplier_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={editingOrder?.status || 'pending'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_delivery">Expected Delivery Date</Label>
              <Input
                type="date"
                id="expected_delivery"
                name="expected_delivery"
                required
                defaultValue={editingOrder?.expected_delivery?.split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Order Items</Label>
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => handleItemChange(index, 'itemId', value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((invItem) => (
                          <SelectItem key={invItem.id} value={invItem.id}>
                            {invItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-24"
                    />
                    <Button type="button" variant="ghost" onClick={() => handleRemoveItem(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={handleAddItem}>
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={editingOrder?.notes || ''}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingOrder(null);
                setOrderItems([]);
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingOrder ? 'Save Changes' : 'Create Order'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
