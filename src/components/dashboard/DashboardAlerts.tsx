import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, X } from "lucide-react";

interface DashboardAlert {
  id: string;
  type: 'low_stock' | 'high_waste';
  status: 'active' | 'resolved' | 'dismissed';
  title: string;
  message: string;
  data: any;
  created_at: string;
}

async function fetchAlerts() {
  console.log('Fetching alerts...');
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active')
    .neq('type', 'expense') // Exclude expense alerts
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }

  // Type guard function to validate alert types
  const isValidAlertType = (type: string): type is DashboardAlert['type'] => {
    return ['low_stock', 'high_waste'].includes(type); // Removed 'expense' from valid types
  };

  // Group alerts by type and keep only the most recent one
  const alertsByType = new Map<string, DashboardAlert>();
  
  data.forEach(alert => {
    if (isValidAlertType(alert.type) && 
        ['active', 'resolved', 'dismissed'].includes(alert.status)) {
      const existingAlert = alertsByType.get(alert.type);
      
      if (!existingAlert || new Date(alert.created_at) > new Date(existingAlert.created_at)) {
        alertsByType.set(alert.type, {
          id: alert.id,
          type: alert.type,
          status: alert.status as DashboardAlert['status'],
          title: alert.title,
          message: alert.message,
          data: alert.data,
          created_at: alert.created_at
        });
      }
    }
  });

  return Array.from(alertsByType.values());
}

async function dismissAlert(alertId: string) {
  const { error } = await supabase
    .from('alerts')
    .update({ status: 'dismissed' })
    .eq('id', alertId);

  if (error) {
    console.error('Error dismissing alert:', error);
    throw error;
  }
}

export function DashboardAlerts() {
  const { toast } = useToast();

  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['dashboardAlerts'],
    queryFn: fetchAlerts,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleDismiss = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      toast({
        description: "Alert dismissed successfully",
      });
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      });
    }
  };

  if (isLoading || error || !alerts?.length) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id}
          variant={alert.type === 'low_stock' ? "default" : "destructive"}
          className="relative pr-12"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => handleDismiss(alert.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  );
}
