import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import type { AppStep } from '@/types/cv';
import logo from '@/assets/cvbuddy-logo.png';

interface NavigationProps {
  onNavigate: (step: AppStep) => void;
  onShowGDPR: () => void;
}

const Navigation = ({ onNavigate, onShowGDPR }: NavigationProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onShowGDPR}
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Personvern
            </button>

            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Min konto
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/saved')}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Mine optimaliseringer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logg ut
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Logg inn
              </Button>
            )}
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
          <div className="md:hidden py-4 border-t border-border space-y-2">
            <button
              onClick={() => {
                onShowGDPR();
                setShowMenu(false);
              }}
              className="block w-full text-left py-2 text-muted-foreground hover:text-foreground"
            >
              Personvern
            </button>
            
            {loading ? (
              <div className="py-2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : user ? (
              <>
                <button
                  onClick={() => {
                    navigate('/saved');
                    setShowMenu(false);
                  }}
                  className="block w-full text-left py-2 text-muted-foreground hover:text-foreground"
                >
                  Mine optimaliseringer
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setShowMenu(false);
                  }}
                  className="block w-full text-left py-2 text-muted-foreground hover:text-foreground"
                >
                  Logg ut
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/auth');
                  setShowMenu(false);
                }}
                className="block w-full text-left py-2 text-primary hover:text-primary/80"
              >
                Logg inn
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
