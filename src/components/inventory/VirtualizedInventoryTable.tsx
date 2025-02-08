
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

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  reorderPoint: number;
}

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
      <TableCell>{item.expiryDate}</TableCell>
      <TableCell>{item.supplier}</TableCell>
      <TableCell>
        {item.quantity === 0 ? (
          <span className="text-red-600 font-medium">Out of Stock</span>
        ) : item.quantity <= item.reorderPoint ? (
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
  const rowHeight = 52; // Adjust based on your actual row height
  const headerHeight = 40; // Adjust based on your actual header height
  const visibleHeight = Math.min(items.length * rowHeight + headerHeight, 400); // Max height of 400px

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
