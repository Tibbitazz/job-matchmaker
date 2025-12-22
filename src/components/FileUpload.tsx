import { useState, useRef } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  label: string;
  accept?: string;
}

export const FileUpload = ({ onTextExtracted, label, accept = '.pdf,.doc,.docx' }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, error: invokeError } = await supabase.functions.invoke('parse-document', {
        body: formData,
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onTextExtracted(data.content);
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke lese filen');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id={`file-upload-${label}`}
      />

      {!file ? (
        <label
          htmlFor={`file-upload-${label}`}
          className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            Last opp {label} (PDF/Word)
          </span>
        </label>
      ) : (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <File className="w-5 h-5 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {file.name}
              </p>
              {loading && (
                <p className="text-xs text-muted-foreground">Leser dokument...</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
