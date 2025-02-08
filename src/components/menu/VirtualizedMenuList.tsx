
import React, { Suspense, lazy } from 'react';
import { FixedSizeGrid } from 'react-window';
import { MenuItem } from '@/types/menu';
import { Skeleton } from "@/components/ui/skeleton";

const MenuItemCard = lazy(() => import('./MenuItemCard'));

interface VirtualizedMenuListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  columnCount: number;
}

const VirtualizedMenuList = React.memo(({ 
  items, 
  onEdit, 
  onDelete, 
  columnCount 
}: VirtualizedMenuListProps) => {
  const rowCount = Math.ceil(items.length / columnCount);
  const cellWidth = window.innerWidth / columnCount - 24;
  const cellHeight = 500;

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const itemIndex = rowIndex * columnCount + columnIndex;
    const item = items[itemIndex];

    if (!item) return null;

    return (
      <div style={{
        ...style,
        padding: '12px',
      }}>
        <Suspense fallback={
          <div className="w-full h-[500px] rounded-lg bg-card animate-pulse" />
        }>
          <MenuItemCard
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Suspense>
      </div>
    );
  };

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={cellWidth}
      height={Math.min(window.innerHeight * 0.8, rowCount * cellHeight)}
      rowCount={rowCount}
      rowHeight={cellHeight}
      width={window.innerWidth - 48}
      overscanRowCount={2}
      overscanColumnCount={1}
    >
      {Cell}
    </FixedSizeGrid>
  );
});

VirtualizedMenuList.displayName = 'VirtualizedMenuList';

export default VirtualizedMenuList;
