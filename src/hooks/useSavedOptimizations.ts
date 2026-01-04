import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CVResult } from '@/types/cv';
import type { Json } from '@/integrations/supabase/types';

export interface SavedOptimization {
  id: string;
  title: string;
  original_cv: string | null;
  job_description: string | null;
  optimized_cv: string;
  cover_letter: string | null;
  analysis: {
    keywords?: string[];
    values?: string[];
    responsibilities?: string[];
    qualifications?: string[];
  } | null;
  created_at: string;
}

const parseAnalysis = (analysis: Json | null): SavedOptimization['analysis'] => {
  if (!analysis || typeof analysis !== 'object' || Array.isArray(analysis)) {
    return null;
  }
  return analysis as SavedOptimization['analysis'];
};

export const useSavedOptimizations = (userId: string | undefined) => {
  const [optimizations, setOptimizations] = useState<SavedOptimization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimizations = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_optimizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const parsed: SavedOptimization[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        original_cv: item.original_cv,
        job_description: item.job_description,
        optimized_cv: item.optimized_cv,
        cover_letter: item.cover_letter,
        analysis: parseAnalysis(item.analysis),
        created_at: item.created_at,
      }));
      
      setOptimizations(parsed);
    } catch (err) {
      console.error('Error fetching optimizations:', err);
      setError('Kunne ikke hente lagrede optimaliseringer');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOptimizations();
  }, [fetchOptimizations]);

  const saveOptimization = async (
    title: string,
    originalCv: string,
    jobDescription: string,
    result: CVResult
  ) => {
    if (!userId) {
      return { error: 'Du må være logget inn for å lagre' };
    }

    try {
      const { error: insertError } = await supabase
        .from('saved_optimizations')
        .insert([{
          user_id: userId,
          title,
          original_cv: originalCv,
          job_description: jobDescription,
          optimized_cv: result.optimizedCV,
          cover_letter: result.coverLetter,
          analysis: result.analysis as unknown as Json,
        }]);

      if (insertError) throw insertError;
      
      await fetchOptimizations();
      return { error: null };
    } catch (err) {
      console.error('Error saving optimization:', err);
      return { error: 'Kunne ikke lagre optimaliseringen' };
    }
  };

  const deleteOptimization = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('saved_optimizations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setOptimizations(prev => prev.filter(opt => opt.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting optimization:', err);
      return { error: 'Kunne ikke slette optimaliseringen' };
    }
  };

  return {
    optimizations,
    loading,
    error,
    saveOptimization,
    deleteOptimization,
    refetch: fetchOptimizations,
  };
};
