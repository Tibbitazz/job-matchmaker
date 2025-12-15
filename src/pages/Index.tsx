import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/CookieBanner';
import GDPRModal from '@/components/GDPRModal';
import ReviewCard from '@/components/ReviewCard';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { useCV } from '@/hooks/useCV';
import { reviews } from '@/data/reviews';
import type { AppStep } from '@/types/cv';
import { 
  Upload, 
  Zap, 
  Download, 
  CheckCircle, 
  Sparkles, 
  AlertCircle, 
  ChevronRight 
} from 'lucide-react';

const Index = () => {
  const [step, setStep] = useState<AppStep>('home');
  const [showGDPR, setShowGDPR] = useState(false);
  const { showBanner, accept, decline } = useCookieConsent();
  const {
    cvText,
    setCvText,
    jobDescription,
    setJobDescription,
    result,
    loading,
    progress,
    error,
    processCV,
    downloadResults,
  } = useCV();

  const handleProcess = async () => {
    await processCV();
    setStep('preview');
  };

  // Home Page
  if (step === 'home') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation onNavigate={setStep} onShowGDPR={() => setShowGDPR(true)} />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-drevet CV-optimalisering
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Optimaliser din CV for det norske arbeidsmarkedet
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Profesjonell AI-teknologi som tilpasser din CV og søknadsbrev til hver enkelt stilling.
              </p>
              
              <Button size="lg" onClick={() => setStep('upload')} className="gap-2">
                Kom i gang
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">87%</p>
                <p className="text-muted-foreground">Høyere ansettelsesrate</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">3.2x</p>
                <p className="text-muted-foreground">Flere intervjuer</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">94%</p>
                <p className="text-muted-foreground">ATS-godkjenning</p>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Slik fungerer det
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Last opp CV</h3>
                  <p className="text-muted-foreground text-sm">
                    Lim inn din CV og stillingsbeskrivelsen
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">AI-optimalisering</h3>
                  <p className="text-muted-foreground text-sm">
                    Avansert AI analyserer og tilpasser innholdet
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Last ned</h3>
                  <p className="text-muted-foreground text-sm">
                    Motta optimalisert CV og søknadsbrev
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-foreground mb-4">
                Hva sier våre brukere?
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                Tusenvis av fornøyde jobbsøkere
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer onNavigate={setStep} onShowGDPR={() => setShowGDPR(true)} />
        
        {showBanner && <CookieBanner onAccept={accept} onDecline={decline} />}
        <GDPRModal open={showGDPR} onClose={() => setShowGDPR(false)} />
      </div>
    );
  }

  // Upload Page
  if (step === 'upload') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation onNavigate={setStep} onShowGDPR={() => setShowGDPR(true)} />
        
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Last opp ditt søknadsmateriale
              </h1>
              <p className="text-muted-foreground">
                Lim inn din CV og stillingsbeskrivelsen for AI-optimalisering
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Teknisk feil</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Din CV (tekst)
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Lim inn din CV her..."
                  className="w-full h-48 px-4 py-3 bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Stillingsbeskrivelse
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Lim inn stillingsbeskrivelsen her..."
                  className="w-full h-40 px-4 py-3 bg-background border border-input rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                onClick={handleProcess}
                disabled={!cvText || !jobDescription || loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {progress || 'Prosesserer...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Optimaliser CV
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>

        {showBanner && <CookieBanner onAccept={accept} onDecline={decline} />}
        <GDPRModal open={showGDPR} onClose={() => setShowGDPR(false)} />
      </div>
    );
  }

  // Preview Page
  if (step === 'preview') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation onNavigate={setStep} onShowGDPR={() => setShowGDPR(true)} />
        
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="bg-card rounded-2xl shadow-lg p-16 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-3">Prosesserer</h3>
                <p className="text-muted-foreground">{progress}</p>
              </div>
            ) : result ? (
              <>
                <div className="bg-primary text-primary-foreground rounded-2xl p-8 mb-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Ferdig!</h2>
                  <p className="opacity-90">Din CV er optimalisert</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4">Original CV</h3>
                    <div className="bg-muted rounded-lg p-4 h-80 overflow-y-auto text-sm text-muted-foreground whitespace-pre-wrap">
                      {cvText}
                    </div>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-sm border-2 border-primary">
                    <h3 className="text-xl font-bold text-foreground mb-4">Optimalisert CV</h3>
                    <div className="bg-primary/10 rounded-lg p-4 h-80 overflow-y-auto text-sm text-foreground whitespace-pre-wrap">
                      {result.optimizedCV}
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-8">
                  <h3 className="text-xl font-bold text-foreground mb-4">Søknadsbrev</h3>
                  <div className="bg-primary/5 rounded-lg p-4 text-foreground whitespace-pre-wrap">
                    {result.coverLetter}
                  </div>
                </div>

                <div className="bg-primary rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                    Last ned komplett pakke
                  </h3>
                  <p className="text-primary-foreground/80 mb-6">CV + Søknadsbrev</p>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={downloadResults}
                    className="gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Last ned nå
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Ingen resultater enda</p>
                <Button onClick={() => setStep('upload')} className="mt-4">
                  Start på nytt
                </Button>
              </div>
            )}
          </div>
        </main>

        {showBanner && <CookieBanner onAccept={accept} onDecline={decline} />}
        <GDPRModal open={showGDPR} onClose={() => setShowGDPR(false)} />
      </div>
    );
  }

  return null;
};

export default Index;
