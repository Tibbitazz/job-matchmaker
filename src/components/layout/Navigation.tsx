import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppStep } from '@/types/cv';
import logo from '@/assets/cvbuddy-logo.png';

interface NavigationProps {
  onNavigate: (step: AppStep) => void;
  onShowGDPR: () => void;
}

const Navigation = ({ onNavigate, onShowGDPR }: NavigationProps) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate('home')}
            className="hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="CV-Buddy" className="h-14" />
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={onShowGDPR}
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Personvern
            </button>
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Meny"
          >
            {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {showMenu && (
          <div className="md:hidden py-4 border-t border-border">
            <button
              onClick={() => {
                onShowGDPR();
                setShowMenu(false);
              }}
              className="block w-full text-left py-2 text-muted-foreground hover:text-foreground"
            >
              Personvern
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
