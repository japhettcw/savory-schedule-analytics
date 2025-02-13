
import React, { useState, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Search, ArrowUpDown } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  supplier: string | null;
  reorder_point: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

interface VirtualizedInventoryTableProps {
  items: InventoryItem[];
}

type SortField = 'name' | 'category' | 'quantity' | 'supplier';
type SortDirection = 'asc' | 'desc';

const Row = React.memo(({ index, style, data: { items, onEdit } }: any) => {
  const item = items[index];
  return (
    <TableRow 
      style={style}
      role="row"
      tabIndex={0}
    >
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell className="capitalize">{item.category}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{item.unit}</TableCell>
      <TableCell>{item.expiry_date}</TableCell>
      <TableCell>{item.supplier}</TableCell>
      <TableCell>
        {item.quantity === 0 ? (
          <span 
            className="text-destructive font-medium"
            role="status"
            aria-label={`${item.name} is out of stock`}
          >
            Out of Stock
          </span>
        ) : item.quantity <= item.reorder_point ? (
          <span 
            className="text-yellow-600 dark:text-yellow-500 font-medium"
            role="status"
            aria-label={`${item.name} is running low on stock`}
          >
            Low Stock
          </span>
        ) : (
          <span 
            className="text-green-600 dark:text-green-500 font-medium"
            role="status"
            aria-label={`${item.name} stock level is good`}
          >
            OK
          </span>
        )}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

Row.displayName = 'InventoryTableRow';

export const VirtualizedInventoryTable = React.memo(({ items }: VirtualizedInventoryTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [supplierFilter, setSupplierFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const categories = useMemo(() => 
    Array.from(new Set(items.map(item => item.category))),
    [items]
  );

  const suppliers = useMemo(() => 
    Array.from(new Set(items.map(item => item.supplier).filter(Boolean) as string[])),
    [items]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Apply filters
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.supplier && item.supplier.toLowerCase().includes(query))
      );
    }

    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }

    if (supplierFilter) {
      result = result.filter(item => item.supplier === supplierFilter);
    }

    if (statusFilter) {
      result = result.filter(item => {
        switch (statusFilter) {
          case 'out':
            return item.quantity === 0;
          case 'low':
            return item.quantity > 0 && item.quantity <= item.reorder_point;
          case 'ok':
            return item.quantity > item.reorder_point;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'supplier':
          comparison = (a.supplier || '').localeCompare(b.supplier || '');
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, searchQuery, categoryFilter, supplierFilter, statusFilter, sortField, sortDirection]);

  const rowHeight = 52;
  const headerHeight = 40;
  const visibleHeight = Math.min(filteredAndSortedItems.length * rowHeight + headerHeight, 400);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    const formData = new FormData(e.currentTarget);
    const updatedItem = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string),
      unit: formData.get('unit') as string,
      supplier: formData.get('supplier') as string,
      reorder_point: parseInt(formData.get('reorder_point') as string),
      expiry_date: formData.get('expiry_date') as string || null,
    };

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(updatedItem)
        .eq('id', editingItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item updated successfully",
      });

      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-8 flex items-center gap-1"
    >
      {children}
      {sortField === field && (
        <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, category, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search inventory items"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All suppliers</SelectItem>
            {suppliers.map(supplier => (
              <SelectItem key={supplier} value={supplier}>
                {supplier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div 
        className="rounded-md border"
        role="region"
        aria-label="Inventory items"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">
                <SortButton field="name">Name</SortButton>
              </TableHead>
              <TableHead scope="col">
                <SortButton field="category">Category</SortButton>
              </TableHead>
              <TableHead scope="col">
                <SortButton field="quantity">Quantity</SortButton>
              </TableHead>
              <TableHead scope="col">Unit</TableHead>
              <TableHead scope="col">Expiry Date</TableHead>
              <TableHead scope="col">
                <SortButton field="supplier">Supplier</SortButton>
              </TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div 
          style={{ height: visibleHeight - headerHeight }}
          tabIndex={0}
          role="grid"
          aria-rowcount={filteredAndSortedItems.length}
        >
          <FixedSizeList
            height={visibleHeight - headerHeight}
            itemCount={filteredAndSortedItems.length}
            itemSize={rowHeight}
            width="100%"
            itemData={{
              items: filteredAndSortedItems,
              onEdit: setEditingItem,
            }}
          >
            {Row}
          </FixedSizeList>
        </div>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingItem?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={editingItem?.category}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue={editingItem?.quantity}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  defaultValue={editingItem?.unit}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select name="supplier" defaultValue={editingItem?.supplier || ''}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No supplier</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                name="reorder_point"
                type="number"
                min="0"
                defaultValue={editingItem?.reorder_point}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                defaultValue={editingItem?.expiry_date?.split('T')[0]}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

VirtualizedInventoryTable.displayName = 'VirtualizedInventoryTable';
