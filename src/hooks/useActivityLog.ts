import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = useCallback(async (actionType: string, actionText: string) => {
    if (!user) return;
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action_type: actionType,
      action_text: actionText,
    });
  }, [user]);

  return { logActivity };
}
