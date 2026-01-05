import { jsPDF } from 'jspdf';

export type TemplateStyle = 'modern' | 'classic' | 'minimalist';

export interface PDFOptions {
  style: TemplateStyle;
  primaryColor: string;
  fontFamily: 'helvetica' | 'times' | 'courier';
}

// Color presets for brand customization
export const colorPresets = [
  { name: 'Blå', value: '#2563eb' },
  { name: 'Grønn', value: '#059669' },
  { name: 'Lilla', value: '#7c3aed' },
  { name: 'Rød', value: '#dc2626' },
  { name: 'Grå', value: '#4b5563' },
  { name: 'Sort', value: '#171717' },
];

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Parse markdown-like content to structured sections
function parseContent(text: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = text.split('\n');
  let currentSection = { title: '', content: '' };

  for (const line of lines) {
    // Check for headers (## or bold **text**)
    const headerMatch = line.match(/^##\s*(.+)$/) || line.match(/^\*\*(.+)\*\*$/);
    if (headerMatch) {
      if (currentSection.title || currentSection.content) {
        sections.push(currentSection);
      }
      currentSection = { title: headerMatch[1].trim(), content: '' };
    } else if (line.trim()) {
      currentSection.content += (currentSection.content ? '\n' : '') + line.trim();
    }
  }

  if (currentSection.title || currentSection.content) {
    sections.push(currentSection);
  }

  return sections;
}

// Wrap text to fit within page width
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    const wrapped = doc.splitTextToSize(paragraph, maxWidth);
    lines.push(...wrapped);
  }

  return lines;
}

export function generateCVPdf(content: string, options: PDFOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = options.style === 'minimalist' ? 25 : 20;
  const contentWidth = pageWidth - margin * 2;
  const primaryRgb = hexToRgb(options.primaryColor);

  let y = margin;

  doc.setFont(options.fontFamily, 'normal');

  const sections = parseContent(content);

  // Add header styling based on template
  if (options.style === 'modern') {
    // Modern: Colored header bar
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, pageWidth, 35, 'F');
    y = 25;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(options.fontFamily, 'bold');
    doc.text('CURRICULUM VITAE', margin, y);
    y = 45;
    doc.setTextColor(0, 0, 0);
  } else if (options.style === 'classic') {
    // Classic: Centered title with underline
    doc.setFontSize(22);
    doc.setFont(options.fontFamily, 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('CURRICULUM VITAE', pageWidth / 2, y + 10, { align: 'center' });
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 15, pageWidth - margin, y + 15);
    y = y + 25;
    doc.setTextColor(0, 0, 0);
  } else {
    // Minimalist: Simple, clean start
    y = margin;
  }

  // Render sections
  for (const section of sections) {
    // Check if we need a new page
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }

    // Section title
    if (section.title) {
      if (options.style === 'modern') {
        doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(options.fontFamily, 'bold');
        doc.text(section.title.toUpperCase(), margin + 3, y + 5.5);
        doc.setTextColor(0, 0, 0);
        y += 12;
      } else if (options.style === 'classic') {
        doc.setFontSize(14);
        doc.setFont(options.fontFamily, 'bold');
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(section.title, margin, y);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        doc.setTextColor(0, 0, 0);
        y += 8;
      } else {
        // Minimalist
        doc.setFontSize(11);
        doc.setFont(options.fontFamily, 'bold');
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(section.title.toUpperCase(), margin, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
      }
    }

    // Section content
    if (section.content) {
      doc.setFontSize(options.style === 'minimalist' ? 10 : 11);
      doc.setFont(options.fontFamily, 'normal');

      const lines = wrapText(doc, section.content, contentWidth);

      for (const line of lines) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }

        // Handle bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const bulletText = line.substring(2);
          doc.text('•', margin, y);
          const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 5);
          for (let i = 0; i < bulletLines.length; i++) {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = margin;
            }
            doc.text(bulletLines[i], margin + 5, y);
            y += 5;
          }
        } else if (line === '') {
          y += 3;
        } else {
          doc.text(line, margin, y);
          y += 5;
        }
      }
      y += 5;
    }
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Side ${i} av ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return doc;
}

export function generateCoverLetterPdf(content: string, options: PDFOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = options.style === 'minimalist' ? 30 : 25;
  const contentWidth = pageWidth - margin * 2;
  const primaryRgb = hexToRgb(options.primaryColor);

  let y = margin;

  doc.setFont(options.fontFamily, 'normal');

  // Header based on style
  if (options.style === 'modern') {
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, 8, pageHeight, 'F');
    y = margin + 10;
  } else if (options.style === 'classic') {
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(1);
    doc.line(margin, margin, pageWidth - margin, margin);
    y = margin + 15;
  }

  // Title
  doc.setFontSize(options.style === 'minimalist' ? 16 : 18);
  doc.setFont(options.fontFamily, 'bold');
  if (options.style !== 'minimalist') {
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  }
  doc.text('Søknadsbrev', options.style === 'modern' ? margin + 5 : margin, y);
  doc.setTextColor(0, 0, 0);
  y += 15;

  // Content
  doc.setFontSize(11);
  doc.setFont(options.fontFamily, 'normal');

  const adjustedMargin = options.style === 'modern' ? margin + 5 : margin;
  const adjustedWidth = options.style === 'modern' ? contentWidth - 5 : contentWidth;

  const lines = wrapText(doc, content, adjustedWidth);

  for (const line of lines) {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = margin;
      if (options.style === 'modern') {
        doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.rect(0, 0, 8, pageHeight, 'F');
      }
    }

    if (line === '') {
      y += 6;
    } else {
      doc.text(line, adjustedMargin, y);
      y += 6;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Side ${i} av ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return doc;
}
