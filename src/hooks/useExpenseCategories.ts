import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface Category {
  id: number;
  name: string;
  keyword: string | null;
  user_id: string;
  created_at: string;
}

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
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

  // Fetch user-specific categories with retry logic
  const fetchCategories = async (retryCount = 0) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user-specific categories
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const types = data || [];
      
      if (types.length === 0 && retryCount < 6) {
        // If no categories exist yet, retry after 500ms
        setTimeout(() => fetchCategories(retryCount + 1), 500);
        return;
      }
      
      setCategories(types);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Category name cannot be empty');
    }
    if (trimmedName.length > 50) {
      throw new Error('Category name must be 50 characters or less');
    }

    // Check for duplicates (case-insensitive)
    const existingCategory = categories.find(
      cat => cat.name && cat.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingCategory) {
      throw new Error('Category already exists');
    }

    try {
      // Insert new category for current user
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: trimmedName,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add category');
    }
  };

  // Reset to defaults (for logout)
  const resetToDefaults = () => {
    setCategories([]);
    setError(null);
    setUser(null);
  };

  // Fetch on mount and auth change
  useEffect(() => {
    if (user) {
      fetchCategories();
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
    categories,
    loading,
    error,
    refetch: fetchCategories,
    addCategory,
  };
};
