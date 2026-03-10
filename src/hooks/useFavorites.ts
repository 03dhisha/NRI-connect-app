import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ItemType = 'housing' | 'restaurant' | 'event';

export function useFavorites(itemType: ItemType) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', user.id)
      .eq('item_type', itemType);
    if (data) setFavoriteIds(new Set(data.map((d: any) => d.item_id)));
  }, [user, itemType]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = async (itemId: string) => {
    if (!user) { toast.error('Please sign in'); return; }
    if (favoriteIds.has(itemId)) {
      await supabase.from('favorites').delete()
        .eq('user_id', user.id).eq('item_type', itemType).eq('item_id', itemId);
      setFavoriteIds(prev => { const n = new Set(prev); n.delete(itemId); return n; });
      toast.success('Removed from favorites');
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, item_type: itemType, item_id: itemId });
      setFavoriteIds(prev => new Set(prev).add(itemId));
      toast.success('Added to favorites');
    }
  };

  const isFavorite = (itemId: string) => favoriteIds.has(itemId);

  return { favoriteIds, toggleFavorite, isFavorite };
}
