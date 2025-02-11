
import React, { Suspense, lazy } from 'react';
import { MenuItem } from '@/types/menu';
import { Skeleton } from "@/components/ui/skeleton";

const MenuItemCard = lazy(() => import('./MenuItemCard'));

interface VirtualizedMenuListProps {
  items: MenuItem[];
  onEdit?: (item: MenuItem) => void;
  onDelete?: (item: MenuItem) => void;
  onAddToOrder?: (item: MenuItem) => void;
  columnCount: number;
}

const VirtualizedMenuList = React.memo(({ 
  items, 
  onEdit, 
  onDelete,
  onAddToOrder,
}: VirtualizedMenuListProps) => {
  console.log('VirtualizedMenuList render:', { items });

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {items.map((item) => (
        <div key={item.id} className="min-w-0">
          <Suspense fallback={
            <div className="w-full h-[500px] rounded-lg bg-card animate-pulse" />
          }>
            <MenuItemCard
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToOrder={onAddToOrder}
            />
          </Suspense>
        </div>
      ))}
    </div>
  );
});

VirtualizedMenuList.displayName = 'VirtualizedMenuList';

export default VirtualizedMenuList;
