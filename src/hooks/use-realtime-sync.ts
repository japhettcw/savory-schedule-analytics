
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

interface UseRealtimeSyncProps {
  tableName: keyof Database['public']['Tables'];
  onDataChange: () => void;
}

export function useRealtimeSync({ tableName, onDataChange }: UseRealtimeSyncProps) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSync = async () => {
      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName
          },
          (payload: RealtimePostgresChangesPayload<Database['public']['Tables'][typeof tableName]['Row']>) => {
            console.log('Change received!', payload);
            onDataChange();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status: ${status}`);
        });
    };

    setupRealtimeSync();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, onDataChange]);
}
