import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface IncomeSource {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export const useIncomeSources = () => {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getCurrentUser();
  }, []);

  // Fetch user-specific income sources with retry logic
  const fetchSources = async (retryCount = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user-specific income sources
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const types = data || [];
      
      if (types.length === 0 && retryCount < 6) {
        // If no sources exist yet, retry after 500ms
        setTimeout(() => fetchSources(retryCount + 1), 500);
        return;
      }
      
      setSources(types);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch income sources');
    } finally {
      setLoading(false);
    }
  };

  const addSource = async (name: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Source name cannot be empty');
    }
    if (trimmedName.length > 50) {
      throw new Error('Source name must be 50 characters or less');
    }

    // Check for duplicates (case-insensitive)
    const existingSource = sources.find(
      source => source.name && source.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingSource) {
      throw new Error('Source already exists');
    }

    try {
      // Insert new income source for current user
      const { data, error } = await supabase
        .from('income_sources')
        .insert({
          name: trimmedName,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setSources(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add income source');
    }
  };

  // Reset to defaults (for logout)
  const resetToDefaults = () => {
    setSources([]);
    setError(null);
    setUser(null);
  };

  // Fetch on mount and auth change
  useEffect(() => {
    if (user) {
      fetchSources();
    }
  }, [user]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        resetToDefaults();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    sources,
    loading,
    error,
    refetch: fetchSources,
    addSource,
  };
};
