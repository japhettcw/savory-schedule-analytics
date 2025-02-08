
import React from 'react';
import { FixedSizeGrid } from 'react-window';
import { MenuItem } from '@/types/menu';
import { MenuItemCard } from './MenuItemCard';

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
  const cellWidth = window.innerWidth / columnCount - 24; // Account for gap
  const cellHeight = 500; // Adjust based on your card height

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const itemIndex = rowIndex * columnCount + columnIndex;
    const item = items[itemIndex];

    if (!item) return null;

    return (
      <div style={{
        ...style,
        padding: '12px',
      }}>
        <MenuItemCard
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
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
      width={window.innerWidth - 48} // Account for page padding
    >
      {Cell}
    </FixedSizeGrid>
  );
});

VirtualizedMenuList.displayName = 'VirtualizedMenuList';

export default VirtualizedMenuList;
