import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface IncomeSource {
  id: string;
  name: string;
  keyword: string | null;
  user_id: string;
  created_at: string;
}

export const useIncomeSources = () => {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all income records to get unique sources (since there's no income_sources table)
      const { data, error } = await supabase
        .from('income')
        .select('source')
        .not('source', 'is', null);

      if (error) throw error;

      // Get unique sources from income records
      const uniqueSources = [...new Set((data || []).map(item => item.source))];

      // Add default sources if they don't exist
      const defaultSources = ['Salary', 'Business', 'Bonus', 'Investment', 'Freelance', 'Gift', 'Other'];
      
      // Combine existing sources with default sources
      const allSources = [...new Set([...uniqueSources, ...defaultSources])].sort();

      // Convert to the expected format
      const formattedSources = allSources.map((source, index) => ({
        id: `source-${index}`,
        name: source,
        keyword: null,
        user_id: '',
        created_at: new Date().toISOString(),
      }));

      setSources(formattedSources);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch income sources');
    } finally {
      setLoading(false);
    }
  };

  const addSource = async (name: string) => {
    try {
      // Validate
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error('Source name cannot be empty');
      }
      if (trimmedName.length > 50) {
        throw new Error('Source name must be 50 characters or less');
      }

      // Check for duplicates (case-insensitive)
      const existingSource = sources.find(
        source => source.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existingSource) {
        throw new Error('Source already exists');
      }

      // Since there's no income_sources table, we just add it to the local state
      // The new source will be available when users add income records
      const newSource = {
        id: `source-${Date.now()}`,
        name: trimmedName,
        keyword: null,
        user_id: '',
        created_at: new Date().toISOString(),
      };

      setSources(prev => [...prev, newSource]);
      return newSource;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add income source');
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return {
    sources,
    loading,
    error,
    refetch: fetchSources,
    addSource,
  };
};
