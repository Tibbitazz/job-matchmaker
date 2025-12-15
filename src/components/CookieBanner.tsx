import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookieBanner = ({ onAccept, onDecline }: CookieBannerProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="font-semibold text-foreground">Informasjonskapsler</h4>
            <p className="text-sm text-muted-foreground">
              Vi bruker nødvendige informasjonskapsler for grunnleggende funksjonalitet.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onDecline}>
            Avvis
          </Button>
          <Button onClick={onAccept}>
            Godta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
