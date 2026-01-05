import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Palette, Type, Layout, Eye } from 'lucide-react';
import {
  generateCVPdf,
  generateCoverLetterPdf,
  colorPresets,
  type TemplateStyle,
  type PDFOptions,
} from '@/lib/pdfTemplates';

interface PDFExportModalProps {
  open: boolean;
  onClose: () => void;
  cvContent: string;
  coverLetterContent: string;
}

type DocumentType = 'cv' | 'coverLetter' | 'both';

export function PDFExportModal({
  open,
  onClose,
  cvContent,
  coverLetterContent,
}: PDFExportModalProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('both');
  const [style, setStyle] = useState<TemplateStyle>('modern');
  const [primaryColor, setPrimaryColor] = useState(colorPresets[0].value);
  const [fontFamily, setFontFamily] = useState<'helvetica' | 'times' | 'courier'>('helvetica');
  const [previewType, setPreviewType] = useState<'cv' | 'coverLetter'>('cv');

  const options: PDFOptions = useMemo(
    () => ({ style, primaryColor, fontFamily }),
    [style, primaryColor, fontFamily]
  );

  // Generate preview data URL
  const previewDataUrl = useMemo(() => {
    try {
      const content = previewType === 'cv' ? cvContent : coverLetterContent;
      if (!content) return null;

      const doc =
        previewType === 'cv'
          ? generateCVPdf(content, options)
          : generateCoverLetterPdf(content, options);

      return doc.output('datauristring');
    } catch (error) {
      console.error('Preview generation error:', error);
      return null;
    }
  }, [cvContent, coverLetterContent, options, previewType]);

  const handleExport = () => {
    try {
      if (documentType === 'cv' || documentType === 'both') {
        const cvDoc = generateCVPdf(cvContent, options);
        cvDoc.save('optimalisert-cv.pdf');
      }

      if (documentType === 'coverLetter' || documentType === 'both') {
        const coverDoc = generateCoverLetterPdf(coverLetterContent, options);
        coverDoc.save('soknadsbrev.pdf');
      }

      onClose();
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Eksporter til PDF
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          {/* Options Panel */}
          <div className="space-y-6">
            {/* Document Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Velg dokumenter
              </Label>
              <RadioGroup
                value={documentType}
                onValueChange={(v) => setDocumentType(v as DocumentType)}
                className="flex flex-wrap gap-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cv" id="doc-cv" />
                  <Label htmlFor="doc-cv" className="cursor-pointer">
                    Kun CV
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coverLetter" id="doc-cl" />
                  <Label htmlFor="doc-cl" className="cursor-pointer">
                    Kun søknadsbrev
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="doc-both" />
                  <Label htmlFor="doc-both" className="cursor-pointer">
                    Begge
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Template Style */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Mal-stil
              </Label>
              <RadioGroup
                value={style}
                onValueChange={(v) => setStyle(v as TemplateStyle)}
                className="grid grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem value="modern" id="style-modern" className="peer sr-only" />
                  <Label
                    htmlFor="style-modern"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-full h-12 bg-primary rounded-t mb-2" />
                    <span className="text-sm font-medium">Moderne</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="classic" id="style-classic" className="peer sr-only" />
                  <Label
                    htmlFor="style-classic"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-full h-12 border-b-2 border-primary flex items-center justify-center">
                      <div className="w-3/4 h-1 bg-muted rounded" />
                    </div>
                    <span className="text-sm font-medium">Klassisk</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="minimalist" id="style-minimal" className="peer sr-only" />
                  <Label
                    htmlFor="style-minimal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div className="w-full h-12 flex flex-col gap-1 justify-center">
                      <div className="w-1/2 h-1 bg-muted rounded" />
                      <div className="w-full h-0.5 bg-muted/50 rounded" />
                    </div>
                    <span className="text-sm font-medium">Minimalistisk</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Aksentfarge
              </Label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setPrimaryColor(preset.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      primaryColor === preset.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Font Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Skrifttype
              </Label>
              <Select value={fontFamily} onValueChange={(v) => setFontFamily(v as typeof fontFamily)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helvetica">Helvetica (Modern)</SelectItem>
                  <SelectItem value="times">Times (Klassisk)</SelectItem>
                  <SelectItem value="courier">Courier (Maskinskrift)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ATS Notice */}
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">ATS-vennlig</p>
              <p>
                Alle maler er optimalisert for å bli korrekt lest av
                rekrutteringssystemer (ATS).
              </p>
            </div>

            <Button onClick={handleExport} className="w-full gap-2" size="lg">
              <Download className="w-5 h-5" />
              Last ned PDF
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Forhåndsvisning
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={previewType === 'cv' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewType('cv')}
                >
                  CV
                </Button>
                <Button
                  variant={previewType === 'coverLetter' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewType('coverLetter')}
                >
                  Søknadsbrev
                </Button>
              </div>
            </div>
            <div className="border rounded-lg bg-muted/30 h-[500px] overflow-hidden">
              {previewDataUrl ? (
                <iframe
                  src={previewDataUrl}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Laster forhåndsvisning...
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
