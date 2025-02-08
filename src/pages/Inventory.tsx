
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AddInventoryDialog } from "@/components/inventory/AddInventoryDialog";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";
import { ExpirationTracker } from "@/components/inventory/ExpirationTracker";
import { OutOfStockNotification } from "@/components/inventory/OutOfStockNotification";
import { SupplierManagement } from "@/components/inventory/SupplierManagement";
import { AutomaticReorderSystem } from "@/components/inventory/AutomaticReorderSystem";
import { OrderTracker } from "@/components/inventory/OrderTracker";
import { IngredientUsageAnalysis } from "@/components/inventory/IngredientUsageAnalysis";
import { WastageReport } from "@/components/inventory/WastageReport";
import { CostAnalysis } from "@/components/inventory/CostAnalysis";
import { VirtualizedInventoryTable } from "@/components/inventory/VirtualizedInventoryTable";
import { WasteForecast } from "@/components/waste/WasteForecast";
import { PortionAdjustmentSuggestion } from "@/components/waste/PortionAdjustmentSuggestion";
import { InventoryWasteLink } from "@/components/waste/InventoryWasteLink";
import { HighWasteAlert } from "@/components/waste/HighWasteAlert";
import { SupplierQualityAlert } from "@/components/waste/SupplierQualityAlert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle>Something went wrong:</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
      <Button onClick={resetErrorBoundary} className="mt-4">Try again</Button>
    </Alert>
  );
}

export default function Inventory() {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserRole = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (rolesError) throw rolesError;
      setUserRole(roles?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user role",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchInventoryItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInventoryItems(data);
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching inventory items:', err);
      setError(err);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInventoryItems();
    fetchUserRole();
  }, [fetchInventoryItems, fetchUserRole]);

  useRealtimeSync({
    tableName: 'inventory_items',
    onDataChange: fetchInventoryItems,
  });

  const canAddItems = userRole === 'manager' || userRole === 'owner';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        {canAddItems && (
          <Button onClick={() => setIsAddInventoryOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        )}
      </div>

      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={fetchInventoryItems}>
        <div className="grid gap-6">
          <HighWasteAlert items={[]} />
          <SupplierQualityAlert issues={[]} />
          <OutOfStockNotification items={inventoryItems} />
          <LowStockAlert items={inventoryItems} />
          <ExpirationTracker items={inventoryItems} />
          {userRole === 'owner' && (
            <>
              <SupplierManagement />
              <AutomaticReorderSystem items={inventoryItems} />
              <OrderTracker />
              <IngredientUsageAnalysis />
              <WastageReport />
              <CostAnalysis />
            </>
          )}
          <VirtualizedInventoryTable 
            items={inventoryItems} 
            isLoading={isLoading}
            error={error}
            userRole={userRole || undefined}
          />
          {userRole === 'manager' || userRole === 'owner' ? (
            <>
              <WasteForecast historicalData={[]} />
              <PortionAdjustmentSuggestion data={[]} />
              <InventoryWasteLink data={[]} />
            </>
          ) : null}
        </div>
      </ErrorBoundary>

      <AddInventoryDialog
        open={isAddInventoryOpen}
        onOpenChange={setIsAddInventoryOpen}
      />
    </div>
  );
}
