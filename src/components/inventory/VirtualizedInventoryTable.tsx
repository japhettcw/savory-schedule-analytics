
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
    <TableRow style={style}>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell className="capitalize">{item.category}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{item.unit}</TableCell>
      <TableCell>{item.expiry_date}</TableCell>
      <TableCell>{item.supplier}</TableCell>
      <TableCell>
        {item.quantity === 0 ? (
          <span className="text-red-600 font-medium">Out of Stock</span>
        ) : item.quantity <= item.reorder_point ? (
          <span className="text-yellow-600 font-medium">Low Stock</span>
        ) : (
          <span className="text-green-600 font-medium">OK</span>
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <div style={{ height: visibleHeight - headerHeight }}>
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
