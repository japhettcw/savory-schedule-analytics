
import React from 'react';
import { FixedSizeList } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";

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

const Row = React.memo(({ index, style, data }: any) => {
  const item = data[index];
  return (
    <TableRow 
      style={style}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // Handle row selection
          console.log('Selected item:', item);
        }
      }}
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
    </TableRow>
  );
});

Row.displayName = 'InventoryTableRow';

export const VirtualizedInventoryTable = React.memo(({ items }: VirtualizedInventoryTableProps) => {
  const rowHeight = 52;
  const headerHeight = 40;
  const visibleHeight = Math.min(items.length * rowHeight + headerHeight, 400);

  return (
    <div 
      className="rounded-md border"
      role="region"
      aria-label="Inventory items"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Name</TableHead>
            <TableHead scope="col">Category</TableHead>
            <TableHead scope="col">Quantity</TableHead>
            <TableHead scope="col">Unit</TableHead>
            <TableHead scope="col">Expiry Date</TableHead>
            <TableHead scope="col">Supplier</TableHead>
            <TableHead scope="col">Status</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div 
        style={{ height: visibleHeight - headerHeight }}
        tabIndex={0}
        role="grid"
        aria-rowcount={items.length}
      >
        <FixedSizeList
          height={visibleHeight - headerHeight}
          itemCount={items.length}
          itemSize={rowHeight}
          width="100%"
          itemData={items}
        >
          {Row}
        </FixedSizeList>
      </div>
    </div>
  );
});

VirtualizedInventoryTable.displayName = 'VirtualizedInventoryTable';
