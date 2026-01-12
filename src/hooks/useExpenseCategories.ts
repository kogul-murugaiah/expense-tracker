import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Category {
  id: string;
  name: string;
  keyword: string | null;
  user_id: string;
  created_at: string;
}

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all categories from the database (same as Expenses page)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Add default categories if they don't exist in database
      const defaultCategories = [
        { id: 'default-food', name: 'Food', keyword: null, user_id: '', created_at: new Date().toISOString() },
        { id: 'default-transport', name: 'Transport', keyword: null, user_id: '', created_at: new Date().toISOString() },
        { id: 'default-utilities', name: 'Utilities', keyword: null, user_id: '', created_at: new Date().toISOString() },
        { id: 'default-entertainment', name: 'Entertainment', keyword: null, user_id: '', created_at: new Date().toISOString() },
        { id: 'default-shopping', name: 'Shopping', keyword: null, user_id: '', created_at: new Date().toISOString() },
        { id: 'default-healthcare', name: 'Healthcare', keyword: null, user_id: '', created_at: new Date().toISOString() },
        { id: 'default-other', name: 'Other', keyword: null, user_id: '', created_at: new Date().toISOString() },
      ];

      // Get existing category names to avoid duplicates
      const existingNames = new Set((data || []).map(cat => cat.name.toLowerCase()));
      
      // Add default categories that don't already exist
      const missingDefaults = defaultCategories.filter(
        cat => !existingNames.has(cat.name.toLowerCase())
      );

      const allCategories = [...(data || []), ...missingDefaults];
      setCategories(allCategories);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    try {
      // Validate
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error('Category name cannot be empty');
      }
      if (trimmedName.length > 50) {
        throw new Error('Category name must be 50 characters or less');
      }

      // Check for duplicates (case-insensitive)
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingCategory) {
        throw new Error('Category already exists');
      }

      // Insert new category (same structure as existing database)
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: trimmedName,
          keyword: null,
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

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    addCategory,
  };
};
