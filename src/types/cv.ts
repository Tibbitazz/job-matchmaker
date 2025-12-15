export interface CVAnalysis {
  keywords: string[];
  values: string[];
  responsibilities: string[];
  qualifications: string[];
}

export interface CVResult {
  optimizedCV: string;
  coverLetter: string;
  analysis: CVAnalysis;
}

export interface Review {
  id: string;
  name: string;
  initials: string;
  location: string;
  rating: number;
  text: string;
}

export type AppStep = 'home' | 'upload' | 'preview';
