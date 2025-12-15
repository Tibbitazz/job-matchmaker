import { Shield, Lock } from 'lucide-react';
import type { AppStep } from '@/types/cv';

interface FooterProps {
  onNavigate: (step: AppStep) => void;
  onShowGDPR: () => void;
}

const Footer = ({ onNavigate, onShowGDPR }: FooterProps) => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">CV-Buddy</h3>
            <p className="text-muted text-sm">
              AI-drevet CV-optimalisering for det norske arbeidsmarkedet.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hurtiglenker</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-muted hover:text-background transition-colors"
                >
                  Hjem
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('upload')}
                  className="text-muted hover:text-background transition-colors"
                >
                  Kom i gang
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Juridisk</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={onShowGDPR}
                  className="text-muted hover:text-background transition-colors"
                >
                  Personvern
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-muted/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted">
              © 2024 CV-Buddy. Alle rettigheter reservert.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                GDPR
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                SSL
              </span>
              <span>🇳🇴 Norge</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
