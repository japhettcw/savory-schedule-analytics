
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
  console.log('VirtualizedMenuList render:', { items, columnCount });
  
  const rowCount = Math.ceil(items.length / columnCount);
  const containerWidth = typeof window !== 'undefined' ? 
    document.querySelector('main')?.clientWidth || window.innerWidth - 80 : // Account for sidebar and padding
    1024;
  const cellWidth = Math.floor((containerWidth - 48) / columnCount); // Account for container padding
  const cellHeight = 500;

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const itemIndex = rowIndex * columnCount + columnIndex;
    const item = items[itemIndex];
    
    console.log('Rendering cell:', { columnIndex, rowIndex, itemIndex, item });

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

  if (items.length === 0) {
    return null;
  }

  console.log('Grid dimensions:', {
    columnCount,
    rowCount,
    cellWidth,
    cellHeight,
    totalItems: items.length
  });

  return (
    <div className="w-full overflow-hidden">
      <FixedSizeGrid
        columnCount={columnCount}
        columnWidth={cellWidth}
        height={Math.min(window.innerHeight * 0.8, rowCount * cellHeight)}
        rowCount={rowCount}
        rowHeight={cellHeight}
        width={containerWidth}
        overscanRowCount={2}
        overscanColumnCount={1}
        className="overflow-hidden"
      >
        {Cell}
      </FixedSizeGrid>
    </div>
  );
});

VirtualizedMenuList.displayName = 'VirtualizedMenuList';

export default VirtualizedMenuList;
