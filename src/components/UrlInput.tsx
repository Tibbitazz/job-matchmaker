import { useState } from 'react';
import { Link, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface UrlInputProps {
  onContentFetched: (content: string) => void;
}

export const UrlInput = ({ onContentFetched }: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('fetch-url', {
        body: { url: url.trim() },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onContentFetched(data.content);
      setSuccess(true);
    } catch (err) {
      console.error('URL fetch error:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke hente innhold fra URL');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setSuccess(false);
              setError(null);
            }}
            placeholder="https://finn.no/job/..."
            className="pl-10 pr-10"
          />
          {(url || success) && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button 
          onClick={handleFetch} 
          disabled={!url.trim() || loading}
          variant={success ? 'secondary' : 'default'}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Check className="w-4 h-4" />
          ) : (
            'Hent'
          )}
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {success && (
        <p className="text-sm text-primary">Stillingsbeskrivelse hentet!</p>
      )}
    </div>
  );
};
