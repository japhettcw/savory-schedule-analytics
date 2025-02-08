
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimePostgresChangesPayload, RealtimeChannel, PostgresChangesFilter } from '@supabase/supabase-js';

type TableName = 'inventory_items' | 'menu_items' | 'menu_item_ingredients' | 'waste_logs';
type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function useRealtimeSync(
  tableName: TableName,
  event: Event = '*',
  callback: () => void
) {
  const { toast } = useToast();

  useEffect(() => {
    const changes: PostgresChangesFilter<'*'> = {
      event: event,
      schema: 'public',
      table: tableName
    };

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', changes, (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
        console.log(`Real-time update from ${tableName}:`, payload);
        callback();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${tableName} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          toast({
            title: "Connection Error",
            description: `Failed to connect to real-time updates for ${tableName}`,
            variant: "destructive",
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, event, callback, toast]);
}
