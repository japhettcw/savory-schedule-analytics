
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

interface UseRealtimeSyncProps {
  tableName: string;
  onDataChange: () => void;
}

export function useRealtimeSync({ tableName, onDataChange }: UseRealtimeSyncProps) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSync = async () => {
      channel = supabase
        .channel('schema-db-changes')
        .on<keyof Database['public']['Tables']>(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName
          },
          (payload) => {
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
