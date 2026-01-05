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

// Clean markdown formatting from text
function cleanMarkdown(text: string): string {
  return text
    // Remove bold markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*(.+?)\*/g, '$1')
    // Remove inline code
    .replace(/`(.+?)`/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    .replace(/^___+$/gm, '')
    .replace(/^\*\*\*+$/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extract contact info from header section
function extractContactInfo(text: string): { name: string; email: string; phone: string; location: string; linkedin: string } {
  const info = { name: '', email: '', phone: '', location: '', linkedin: '' };
  
  // Try to find name (usually first non-empty line or after # heading)
  const nameMatch = text.match(/^#\s+(.+)$/m) || text.match(/^([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/m);
  if (nameMatch) info.name = cleanMarkdown(nameMatch[1].trim());
  
  // Email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) info.email = emailMatch[0];
  
  // Phone (Norwegian format)
  const phoneMatch = text.match(/(?:\+47\s?)?(?:\d{2}\s?){4}|\d{8}/);
  if (phoneMatch) info.phone = phoneMatch[0].replace(/\s/g, ' ');
  
  // Location
  const locationMatch = text.match(/(?:Oslo|Bergen|Trondheim|Stavanger|Kristiansand|Drammen|Tromsø|Fredrikstad|Sandnes|Sarpsborg|Skien|Ålesund|Sandefjord|Haugesund|Moss|Arendal|Bodø|Tønsberg|Hamar|Larvik|Halden|Steinkjer|Lillehammer|Molde|Harstad|Gjøvik|Narvik|Alta|Kongsberg|Elverum|Hammerfest|Kristiansund|Horten|Rana|Kongsvinger|Notodden|Leirvik|Mandal|Grimstad|Brumunddal|Voss|Egersund|Mysen|Hønefoss|Vennesla|Finnsnes|Ski|Førde|Mosjøen|Sandvika|Asker|Lillestrøm|Jessheim|Kolbotn|Drøbak|Ås|Vinterbro|Nesoddtangen|Nesodden|Fornebu|Lysaker|Bærum|Nittedal|Lørenskog|Skedsmo|Rælingen|Enebakk|Fetsund|Sørum|Aurskog|Årnes|Eidsvoll|Dal|Nannestad|Gran|Lunner|Jevnaker|Hole|Ringerike)[,\s]+(?:Norge)?/i);
  if (locationMatch) info.location = locationMatch[0].trim();
  
  // LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) info.linkedin = linkedinMatch[0];
  
  return info;
}

interface CVSection {
  title: string;
  items: CVItem[];
}

interface CVItem {
  title?: string;
  subtitle?: string;
  content: string[];
}

// Parse CV content into structured sections
function parseCVContent(text: string): { contactInfo: ReturnType<typeof extractContactInfo>; sections: CVSection[] } {
  const contactInfo = extractContactInfo(text);
  const sections: CVSection[] = [];
  
  // Split by major headers (## or ###)
  const headerPattern = /^#{1,3}\s+(.+)$/gm;
  const parts = text.split(headerPattern);
  
  let currentSection: CVSection | null = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    
    // Check if this is a header (odd indices after split)
    if (i % 2 === 1) {
      // This is a header
      const title = cleanMarkdown(part);
      // Skip contact info headers
      if (title.toLowerCase().includes('kontakt') || 
          title.toLowerCase() === contactInfo.name.toLowerCase() ||
          title.match(/^[a-z]+@[a-z]+\./i)) {
        continue;
      }
      currentSection = { title, items: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      // This is content under a header
      const lines = part.split('\n').filter(l => l.trim() && !l.match(/^---+$/));
      const items: CVItem[] = [];
      let currentItem: CVItem = { content: [] };
      
      for (const line of lines) {
        const cleanLine = cleanMarkdown(line.trim());
        if (!cleanLine) continue;
        
        // Check for sub-headers (job titles, etc.)
        const subHeaderMatch = line.match(/^#+\s+(.+)$/) || line.match(/^\*\*(.+)\*\*$/);
        if (subHeaderMatch) {
          if (currentItem.content.length > 0 || currentItem.title) {
            items.push(currentItem);
          }
          currentItem = { title: cleanMarkdown(subHeaderMatch[1]), content: [] };
        } else if (line.match(/^\s*[-•*]\s+/)) {
          // Bullet point
          const bulletContent = cleanLine.replace(/^[-•*]\s+/, '');
          currentItem.content.push(bulletContent);
        } else if (cleanLine) {
          // Regular text - might be company/date info or paragraph
          if (!currentItem.subtitle && currentItem.title && cleanLine.includes('|')) {
            currentItem.subtitle = cleanLine;
          } else {
            currentItem.content.push(cleanLine);
          }
        }
      }
      
      if (currentItem.content.length > 0 || currentItem.title) {
        items.push(currentItem);
      }
      
      currentSection.items = items;
    }
  }
  
  return { contactInfo, sections };
}

// Wrap text to fit within page width
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
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

  const { contactInfo, sections } = parseCVContent(content);

  // Header based on template style
  if (options.style === 'modern') {
    // Modern: Colored header bar with name
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(options.fontFamily, 'bold');
    doc.text(contactInfo.name || 'CV', margin, 25);
    
    // Contact info in header
    doc.setFontSize(10);
    doc.setFont(options.fontFamily, 'normal');
    const contactParts = [contactInfo.email, contactInfo.phone, contactInfo.location].filter(Boolean);
    if (contactParts.length > 0) {
      doc.text(contactParts.join('  |  '), margin, 35);
    }
    if (contactInfo.linkedin) {
      doc.text(contactInfo.linkedin, margin, 41);
    }
    
    y = 55;
    doc.setTextColor(0, 0, 0);
  } else if (options.style === 'classic') {
    // Classic: Centered name with elegant styling
    doc.setFontSize(24);
    doc.setFont(options.fontFamily, 'bold');
    doc.text(contactInfo.name || 'Curriculum Vitae', pageWidth / 2, y + 10, { align: 'center' });
    
    // Contact info centered
    doc.setFontSize(10);
    doc.setFont(options.fontFamily, 'normal');
    doc.setTextColor(80, 80, 80);
    const contactLine = [contactInfo.email, contactInfo.phone, contactInfo.location].filter(Boolean).join('  •  ');
    if (contactLine) {
      doc.text(contactLine, pageWidth / 2, y + 18, { align: 'center' });
    }
    if (contactInfo.linkedin) {
      doc.text(contactInfo.linkedin, pageWidth / 2, y + 24, { align: 'center' });
    }
    
    // Decorative line
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.8);
    doc.line(margin + 20, y + 30, pageWidth - margin - 20, y + 30);
    
    y = y + 40;
    doc.setTextColor(0, 0, 0);
  } else {
    // Minimalist: Clean, simple header
    doc.setFontSize(20);
    doc.setFont(options.fontFamily, 'bold');
    doc.text(contactInfo.name || 'CV', margin, y + 8);
    
    doc.setFontSize(9);
    doc.setFont(options.fontFamily, 'normal');
    doc.setTextColor(100, 100, 100);
    const contactLine = [contactInfo.email, contactInfo.phone, contactInfo.location].filter(Boolean).join('  |  ');
    if (contactLine) {
      doc.text(contactLine, margin, y + 15);
    }
    if (contactInfo.linkedin) {
      doc.text(contactInfo.linkedin, margin, y + 20);
    }
    
    y = y + 28;
    doc.setTextColor(0, 0, 0);
  }

  // Render sections
  for (const section of sections) {
    // Check if we need a new page
    if (y > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }

    // Section title
    if (section.title) {
      y += 4; // Add spacing before section
      
      if (options.style === 'modern') {
        doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont(options.fontFamily, 'bold');
        doc.text(section.title.toUpperCase(), margin + 3, y + 5.5);
        doc.setTextColor(0, 0, 0);
        y += 14;
      } else if (options.style === 'classic') {
        doc.setFontSize(13);
        doc.setFont(options.fontFamily, 'bold');
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(section.title.toUpperCase(), margin, y + 4);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, y + 7, pageWidth - margin, y + 7);
        doc.setTextColor(0, 0, 0);
        y += 14;
      } else {
        // Minimalist
        doc.setFontSize(10);
        doc.setFont(options.fontFamily, 'bold');
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(section.title.toUpperCase(), margin, y + 4);
        doc.setTextColor(0, 0, 0);
        y += 10;
      }
    }

    // Section items
    for (const item of section.items) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      // Item title (e.g., job position)
      if (item.title) {
        doc.setFontSize(11);
        doc.setFont(options.fontFamily, 'bold');
        doc.text(item.title, margin, y);
        y += 5;
      }

      // Item subtitle (e.g., company | dates)
      if (item.subtitle) {
        doc.setFontSize(10);
        doc.setFont(options.fontFamily, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(item.subtitle, margin, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }

      // Item content (bullet points or paragraphs)
      doc.setFontSize(10);
      doc.setFont(options.fontFamily, 'normal');
      
      for (const line of item.content) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
        }

        // Check if this looks like a bullet point content
        const isBullet = item.content.length > 1 || (item.title && item.content.length > 0);
        
        if (isBullet) {
          doc.text('•', margin, y);
          const wrappedLines = wrapText(doc, line, contentWidth - 8);
          for (let i = 0; i < wrappedLines.length; i++) {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = margin;
            }
            doc.text(wrappedLines[i], margin + 5, y);
            y += 4.5;
          }
        } else {
          const wrappedLines = wrapText(doc, line, contentWidth);
          for (const wl of wrappedLines) {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = margin;
            }
            doc.text(wl, margin, y);
            y += 4.5;
          }
        }
      }
      
      y += 2; // Space between items
    }
    
    y += 3; // Space after section
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

  // Clean the content of markdown
  const cleanedContent = cleanMarkdown(content);
  const lines = cleanedContent.split('\n').filter(l => l.trim());

  // Extract potential sender info from first lines
  let senderInfo: string[] = [];
  let bodyStartIndex = 0;
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Check if line looks like contact info
    if (line.match(/[@|]/) || line.match(/\d{8}/) || line.match(/^\d{4}\s+\w+/) || i === 0) {
      senderInfo.push(line);
      bodyStartIndex = i + 1;
    } else {
      break;
    }
  }

  // Header based on style
  if (options.style === 'modern') {
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, 8, pageHeight, 'F');
    
    // Sender info in top right
    if (senderInfo.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      let infoY = margin;
      for (const info of senderInfo) {
        doc.text(info, pageWidth - margin, infoY, { align: 'right' });
        infoY += 5;
      }
      y = Math.max(y, infoY + 10);
    }
    
    y = Math.max(y, margin + 20);
  } else if (options.style === 'classic') {
    // Sender info at top
    if (senderInfo.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      for (const info of senderInfo) {
        doc.text(info, margin, y);
        y += 5;
      }
      y += 5;
    }
    
    // Decorative line
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;
  } else {
    // Minimalist - sender info inline
    if (senderInfo.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      for (const info of senderInfo) {
        doc.text(info, margin, y);
        y += 4;
      }
      y += 10;
    }
  }

  // Title
  doc.setFontSize(options.style === 'minimalist' ? 14 : 16);
  doc.setFont(options.fontFamily, 'bold');
  doc.setTextColor(options.style === 'minimalist' ? 0 : primaryRgb.r, options.style === 'minimalist' ? 0 : primaryRgb.g, options.style === 'minimalist' ? 0 : primaryRgb.b);
  doc.text('Søknad', options.style === 'modern' ? margin + 5 : margin, y);
  doc.setTextColor(0, 0, 0);
  y += 12;

  // Body content
  doc.setFontSize(11);
  doc.setFont(options.fontFamily, 'normal');

  const adjustedMargin = options.style === 'modern' ? margin + 5 : margin;
  const adjustedWidth = options.style === 'modern' ? contentWidth - 10 : contentWidth;

  // Process body paragraphs
  for (let i = bodyStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (y > pageHeight - 25) {
      doc.addPage();
      y = margin;
      if (options.style === 'modern') {
        doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.rect(0, 0, 8, pageHeight, 'F');
      }
    }

    const wrappedLines = wrapText(doc, line, adjustedWidth);
    for (const wl of wrappedLines) {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = margin;
        if (options.style === 'modern') {
          doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          doc.rect(0, 0, 8, pageHeight, 'F');
        }
      }
      doc.text(wl, adjustedMargin, y);
      y += 6;
    }
    y += 4; // Paragraph spacing
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
