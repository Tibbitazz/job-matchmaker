import { X, Shield, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GDPRModalProps {
  open: boolean;
  onClose: () => void;
}

const GDPRModal = ({ open, onClose }: GDPRModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Personvern og datasikkerhet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground">GDPR-compliance</h3>
              <p className="text-sm text-muted-foreground">
                Tjenesten overholder EUs personvernforordning (GDPR) og norsk personvernlovgivning.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground">Databehandling</h3>
              <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                <li>• CV-tekst og stillingsbeskrivelser behandles kun for optimalisering</li>
                <li>• Data slettes automatisk etter behandling</li>
                <li>• Aldri delt med tredjeparter</li>
                <li>• Kryptert overføring</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground">Dine rettigheter</h3>
              <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                <li>• Rett til innsyn</li>
                <li>• Rett til retting</li>
                <li>• Rett til sletting</li>
                <li>• Rett til dataportabilitet</li>
              </ul>
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Lukk
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default GDPRModal;
