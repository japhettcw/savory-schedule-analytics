
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
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Database } from "@/integrations/supabase/types";

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];

interface VirtualizedInventoryTableProps {
  items: InventoryItem[];
  isLoading?: boolean;
  error?: Error | null;
  userRole?: string;
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

export const VirtualizedInventoryTable = React.memo(({ 
  items, 
  isLoading, 
  error,
  userRole 
}: VirtualizedInventoryTableProps) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load inventory items: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const rowHeight = 52;
  const headerHeight = 40;
  const visibleHeight = Math.min((items?.length || 0) * rowHeight + headerHeight, 400);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Only staff and above can view all details
  const canViewFullDetails = userRole === 'staff' || userRole === 'manager' || userRole === 'owner';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            {canViewFullDetails && (
              <>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
      </Table>
      <div style={{ height: visibleHeight - headerHeight }}>
        <FixedSizeList
          height={visibleHeight - headerHeight}
          itemCount={items?.length || 0}
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
