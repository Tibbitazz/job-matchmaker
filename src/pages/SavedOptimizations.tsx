import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSavedOptimizations, SavedOptimization } from '@/hooks/useSavedOptimizations';
import { 
  FileText, 
  Download, 
  Trash2, 
  Loader2, 
  Calendar,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SavedOptimizations = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { optimizations, loading, deleteOptimization } = useSavedOptimizations(user?.id);
  const [selectedOptimization, setSelectedOptimization] = useState<SavedOptimization | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    await deleteOptimization(deleteId);
    setDeleteId(null);
    setDeleting(false);
  };

  const downloadOptimization = (opt: SavedOptimization) => {
    const content = `=== OPTIMALISERT CV ===\n\n${opt.optimized_cv}\n\n\n=== SØKNADSBREV ===\n\n${opt.cover_letter || 'Ikke generert'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${opt.title.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation onNavigate={() => navigate('/')} onShowGDPR={() => {}} />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mine optimaliseringer</h1>
              <p className="text-muted-foreground mt-1">
                Tidligere lagrede CV-er og søknadsbrev
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="gap-2">
              Ny optimalisering
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {optimizations.length === 0 ? (
            <div className="bg-card rounded-xl p-12 text-center border border-border">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ingen lagrede optimaliseringer
              </h2>
              <p className="text-muted-foreground mb-6">
                Når du optimaliserer en CV, kan du lagre den her for senere bruk.
              </p>
              <Button onClick={() => navigate('/')}>
                Optimaliser din første CV
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {optimizations.map((opt) => (
                <div
                  key={opt.id}
                  className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-foreground truncate">
                          {opt.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(opt.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOptimization(opt)}
                      >
                        Vis
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadOptimization(opt)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(opt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={() => navigate('/')} onShowGDPR={() => {}} />

      {/* View Optimization Dialog */}
      {selectedOptimization && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {selectedOptimization.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOptimization(null)}
              >
                Lukk
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Optimalisert CV</h3>
                  <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap font-mono">
                    {selectedOptimization.optimized_cv}
                  </div>
                </div>
                {selectedOptimization.cover_letter && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Søknadsbrev</h3>
                    <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">
                      {selectedOptimization.cover_letter}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett optimalisering</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette denne optimaliseringen? Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Slett'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavedOptimizations;
