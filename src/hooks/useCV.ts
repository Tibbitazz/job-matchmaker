import { useState } from 'react';
import type { CVResult } from '@/types/cv';

// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useCV = () => {
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<CVResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const processCV = async () => {
    if (!cvText || !jobDescription) return;

    setLoading(true);
    setError('');

    try {
      setProgress('Analyserer stillingsbeskrivelsen...');
      await delay(1500);

      setProgress('Optimaliserer CV-en...');
      await delay(2000);

      setProgress('Genererer søknadsbrev...');
      await delay(1500);

      // Mock result
      const mockResult: CVResult = {
        optimizedCV: `SAMMENDRAG
Erfaren profesjonell med dokumentert evne til å levere resultater. Kombinerer teknisk kompetanse med sterke samarbeidsevner og forståelse for det norske arbeidsmarkedet.

ERFARING
${cvText.slice(0, 200)}...

NØKKELKOMPETANSE
• Teamarbeid og samarbeid
• Prosjektledelse
• Resultatfokusert tilnærming
• Kommunikasjon på norsk og engelsk

UTDANNING
Relevant utdanning tilpasset stillingen`,
        coverLetter: `Kjære [Arbeidsgiver],

Jeg søker herved på stillingen som beskrevet i utlysningen. Min bakgrunn og erfaring gjør meg til en sterk kandidat for denne rollen.

Gjennom min karriere har jeg utviklet kompetanse som er direkte relevant for de oppgavene stillingen innebærer. Jeg er særlig motivert av muligheten til å bidra i et team som verdsetter samarbeid og innovasjon.

Jeg ser frem til muligheten for å diskutere hvordan jeg kan bidra til deres organisasjon.

Med vennlig hilsen,
[Ditt navn]`,
        analysis: {
          keywords: ['teamarbeid', 'erfaring', 'kompetanse'],
          values: ['samarbeid', 'innovasjon'],
          responsibilities: [],
          qualifications: [],
        },
      };

      setResult(mockResult);
    } catch (err) {
      setError('Noe gikk galt. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const downloadResults = () => {
    if (!result) return;

    const content = `=== OPTIMALISERT CV ===\n\n${result.optimizedCV}\n\n=== SØKNADSBREV ===\n\n${result.coverLetter}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-optimalisert.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
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
  };
};
