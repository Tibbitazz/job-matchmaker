import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'Ingen fil lastet opp' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    const fileName = file.name.toLowerCase();
    const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf';
    const isWord = fileName.endsWith('.docx') || fileName.endsWith('.doc') || 
                   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.type === 'application/msword';

    if (!isPDF && !isWord) {
      return new Response(JSON.stringify({ 
        error: 'Kun PDF og Word-dokumenter (.doc, .docx) er støttet' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let text = '';

    if (isPDF) {
      // Extract text from PDF
      text = await extractPDFText(bytes);
    } else if (isWord) {
      // Extract text from Word document
      text = await extractWordText(bytes, fileName.endsWith('.docx'));
    }

    // Clean up the extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text || text.length < 10) {
      return new Response(JSON.stringify({ 
        error: 'Kunne ikke lese tekst fra dokumentet. Prøv å lime inn teksten manuelt.',
        hint: 'Dokumentet kan være skannet eller ha beskyttet innhold.'
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Extracted text length:', text.length);

    return new Response(JSON.stringify({ 
      content: text,
      fileName: file.name,
      fileType: isPDF ? 'pdf' : 'word'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error parsing document:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Kunne ikke lese dokumentet' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function extractPDFText(bytes: Uint8Array): Promise<string> {
  // Basic PDF text extraction
  // This extracts text from simple PDFs - for complex PDFs with images/scans, 
  // users should paste text manually
  
  const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  const textParts: string[] = [];
  
  // Look for text streams in the PDF
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  
  while ((match = streamRegex.exec(content)) !== null) {
    const streamContent = match[1];
    
    // Try to extract text from text operators
    const textRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ|<([^>]+)>\s*Tj/g;
    let textMatch;
    
    while ((textMatch = textRegex.exec(streamContent)) !== null) {
      const text = textMatch[1] || textMatch[2] || textMatch[3] || '';
      if (text) {
        // Clean up the text
        const cleaned = text
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, ' ')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\'/g, "'");
        textParts.push(cleaned);
      }
    }
  }
  
  // Also try to find plain text in the PDF
  const plainTextRegex = /BT\s*([\s\S]*?)\s*ET/g;
  while ((match = plainTextRegex.exec(content)) !== null) {
    const btContent = match[1];
    const tjRegex = /\(([^)]+)\)/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(btContent)) !== null) {
      textParts.push(tjMatch[1]);
    }
  }
  
  // Try to extract from content directly if nothing found
  if (textParts.length === 0) {
    // Look for readable text patterns
    const readableRegex = /([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå\s,.\-:;!?'"()0-9]{10,})/g;
    while ((match = readableRegex.exec(content)) !== null) {
      textParts.push(match[1]);
    }
  }
  
  return textParts.join(' ');
}

async function extractWordText(bytes: Uint8Array, isDocx: boolean): Promise<string> {
  if (!isDocx) {
    // For .doc files, try basic extraction
    const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    // Extract readable text
    const textParts: string[] = [];
    const readableRegex = /([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå\s,.\-:;!?'"()0-9@]{5,})/g;
    let match;
    while ((match = readableRegex.exec(content)) !== null) {
      textParts.push(match[1]);
    }
    return textParts.join(' ');
  }
  
  // For .docx files (ZIP-based format)
  // Extract document.xml from the ZIP archive
  try {
    // Find the local file header for document.xml
    const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    
    // Look for XML content in the docx
    const xmlMatch = content.match(/<w:document[^>]*>([\s\S]*?)<\/w:document>/);
    if (xmlMatch) {
      // Extract text from <w:t> tags
      const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      const textParts: string[] = [];
      let match;
      while ((match = textRegex.exec(xmlMatch[1])) !== null) {
        textParts.push(match[1]);
      }
      return textParts.join(' ');
    }
    
    // Fallback: extract any readable text
    const textParts: string[] = [];
    const readableRegex = /([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå\s,.\-:;!?'"()0-9@]{5,})/g;
    let match;
    while ((match = readableRegex.exec(content)) !== null) {
      textParts.push(match[1]);
    }
    return textParts.join(' ');
    
  } catch (error) {
    console.error('Error extracting DOCX:', error);
    throw new Error('Kunne ikke lese Word-dokumentet');
  }
}
