import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CVResult } from '@/types/cv';

export const useCV = () => {
  const [cvText, setCvText] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<CVResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const processCV = async () => {
    if (!cvText || !jobDescription) {
      setError('Vennligst fyll ut både CV og stillingsbeskrivelse');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      setProgress('Analyserer stillingsbeskrivelsen...');
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress('Optimaliserer CV med AI...');

      const { data, error: invokeError } = await supabase.functions.invoke('optimize-cv', {
        body: {
          cvText,
          coverLetterText,
          jobDescription,
        },
      });

      if (invokeError) {
        console.error('Supabase invoke error:', invokeError);
        throw new Error(invokeError.message || 'Kunne ikke kontakte AI-tjenesten');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setProgress('Ferdigstiller resultater...');
      await new Promise(resolve => setTimeout(resolve, 300));

      const cvResult: CVResult = {
        optimizedCV: data.optimizedCV || '',
        coverLetter: data.coverLetter || '',
        analysis: {
          keywords: data.analysis?.keywords || [],
          values: data.analysis?.values || [],
          responsibilities: data.analysis?.strengths || [],
          qualifications: data.analysis?.improvements || [],
        },
      };

      setResult(cvResult);
    } catch (err) {
      console.error('CV processing error:', err);
      setError(err instanceof Error ? err.message : 'En uventet feil oppstod. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const downloadCV = () => {
    if (!result?.optimizedCV) return;

    const content = result.optimizedCV;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimalisert-cv.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCoverLetter = () => {
    if (!result?.coverLetter) return;

    const content = result.coverLetter;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soknadsbrev.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    if (!result) return;

    const content = `=== OPTIMALISERT CV ===\n\n${result.optimizedCV}\n\n\n=== SØKNADSBREV ===\n\n${result.coverLetter}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-og-soknadsbrev.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setCvText('');
    setCoverLetterText('');
    setJobDescription('');
    setResult(null);
    setError('');
    setProgress('');
  };

  return {
    cvText,
    setCvText,
    coverLetterText,
    setCoverLetterText,
    jobDescription,
    setJobDescription,
    result,
    loading,
    progress,
    error,
    processCV,
    downloadCV,
    downloadCoverLetter,
    downloadResults,
    reset,
  };
};
