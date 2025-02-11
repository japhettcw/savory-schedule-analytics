
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { MenuItem } from "@/types/menu";
import { AddEditMenuDialog } from "@/components/menu/AddEditMenuDialog";

interface MenuItemManagerProps {
  selectedItem: MenuItem | undefined;
  isAddEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  onAddNewClick: () => void;
  onEditClick: (item: MenuItem) => void;
  onDeleteClick: (item: MenuItem) => void;
  onAddEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onSave: (item: MenuItem) => void;
  onDelete: () => void;
}

export function MenuItemManager({
  selectedItem,
  isAddEditDialogOpen,
  isDeleteDialogOpen,
  onAddNewClick,
  onEditClick,
  onDeleteClick,
  onAddEditDialogChange,
  onDeleteDialogChange,
  onSave,
  onDelete,
}: MenuItemManagerProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant's menu items
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={onAddNewClick}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <AddEditMenuDialog
        open={isAddEditDialogOpen}
        onOpenChange={onAddEditDialogChange}
        item={selectedItem}
        onSave={onSave}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
