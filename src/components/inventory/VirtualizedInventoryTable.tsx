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
import { cn } from "@/lib/utils";

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
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

type SortField = 'name' | 'sku' | 'category' | 'quantity' | 'unit_price';
type SortDirection = 'asc' | 'desc';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const Row = React.memo(({ index, style, data: { items, onEdit } }: any) => {
  const item = items[index];
  const isLowStock = item.quantity <= item.reorder_point;
  const isOutOfStock = item.quantity === 0;

  return (
    <TableRow 
      style={{
        ...style,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)'
      }}
      className={cn(
        isOutOfStock && "bg-red-50 dark:bg-red-950",
        isLowStock && !isOutOfStock && "bg-yellow-50 dark:bg-yellow-950"
      )}
    >
      <TableCell className="flex-[2] min-w-[200px] font-medium">{item.name}</TableCell>
      <TableCell className="flex-1 min-w-[120px] font-mono text-sm">{item.sku}</TableCell>
      <TableCell className="flex-1 min-w-[120px] capitalize">{item.category}</TableCell>
      <TableCell className="flex-1 min-w-[120px] text-right">
        <span className={cn(
          "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-medium",
          isOutOfStock && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          isLowStock && !isOutOfStock && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          !isLowStock && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        )}>
          {item.quantity.toLocaleString()} {item.unit}
        </span>
      </TableCell>
      <TableCell className="flex-1 min-w-[100px] text-right tabular-nums">
        {formatCurrency(item.unit_price)}
      </TableCell>
      <TableCell className="flex-1 min-w-[120px]">
        {item.supplier || "—"}
      </TableCell>
      <TableCell className="flex-1 min-w-[120px] text-center">
        {isOutOfStock ? (
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            role="status"
          >
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            role="status"
          >
            Low Stock
          </span>
        ) : (
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            role="status"
          >
            In Stock
          </span>
        )}
      </TableCell>
      <TableCell className="flex-none w-[80px] text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="h-8 w-8"
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
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.supplier && item.supplier.toLowerCase().includes(query))
      );
    }

    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }

    if (supplierFilter && supplierFilter !== 'all') {
      result = result.filter(item => item.supplier === supplierFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
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
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'unit_price':
          comparison = a.unit_price - b.unit_price;
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
            placeholder="Search by name, SKU, category, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
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
            <SelectItem value="all">All suppliers</SelectItem>
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
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="flex w-full">
              <TableHead className="flex-[2] min-w-[200px]">
                <Button variant="ghost" onClick={() => handleSort('name')} className="h-8 flex items-center gap-1">
                  Name {sortField === 'name' && <ArrowUpDown className="h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="flex-1 min-w-[120px]">
                <Button variant="ghost" onClick={() => handleSort('sku')} className="h-8 flex items-center gap-1">
                  SKU {sortField === 'sku' && <ArrowUpDown className="h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="flex-1 min-w-[120px]">
                <Button variant="ghost" onClick={() => handleSort('category')} className="h-8 flex items-center gap-1">
                  Category {sortField === 'category' && <ArrowUpDown className="h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="flex-1 min-w-[120px] text-right">
                <Button variant="ghost" onClick={() => handleSort('quantity')} className="h-8 flex items-center gap-1 justify-end">
                  Quantity {sortField === 'quantity' && <ArrowUpDown className="h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="flex-1 min-w-[100px] text-right">
                <Button variant="ghost" onClick={() => handleSort('unit_price')} className="h-8 flex items-center gap-1 justify-end">
                  Price {sortField === 'unit_price' && <ArrowUpDown className="h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead className="flex-1 min-w-[120px]">Supplier</TableHead>
              <TableHead className="flex-1 min-w-[120px] text-center">Status</TableHead>
              <TableHead className="flex-none w-[80px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div style={{ height: visibleHeight - headerHeight }}>
          <FixedSizeList
            height={visibleHeight - headerHeight}
            itemCount={filteredAndSortedItems.length}
            itemSize={52}
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
        <DialogContent className="fixed left-[50%] top-[50%] z-[9999] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
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
              <Select name="supplier" defaultValue={editingItem?.supplier || 'none'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No supplier</SelectItem>
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
