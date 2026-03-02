import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  name_en: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  receipt_footer: string | null;
  settings_password: string | null;
  created_at: string;
  updated_at: string;
}

export function useRestaurant() {
  const { user, isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setRestaurant(null);
      setIsLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setRestaurant(data);
      }
      setIsLoading(false);
    };

    fetchRestaurant();
  }, [user, isAuthenticated]);

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!restaurant) return { error: new Error('No restaurant found') };
    
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurant.id)
      .select()
      .single();

    if (!error && data) {
      setRestaurant(data);
    }
    return { data, error };
  };

  return {
    restaurant,
    restaurantId: restaurant?.id ?? null,
    isLoading,
    updateRestaurant,
  };
}
