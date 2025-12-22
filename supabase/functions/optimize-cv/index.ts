import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CV_TEMPLATE = `
# [FULLT NAVN]
📧 [E-post] | 📱 [Telefon] | 📍 [Sted]
LinkedIn: [lenke] | GitHub: [lenke hvis relevant]

---

## PROFESJONELL PROFIL
[2-3 setninger som oppsummerer din erfaring, styrker og karrieremål tilpasset stillingen]

---

## NØKKELKOMPETANSE
• [Kompetanse 1]
• [Kompetanse 2]
• [Kompetanse 3]
• [Kompetanse 4]
• [Kompetanse 5]
• [Kompetanse 6]

---

## ARBEIDSERFARING

### [Stillingstittel]
**[Bedriftsnavn]** | [Sted] | [Startdato] – [Sluttdato/Nåværende]

• [Konkret oppnåelse med målbare resultater]
• [Ansvar og oppgaver relevante for målstillingen]
• [Prosjekt eller initiativ du ledet/bidro til]

### [Stillingstittel]
**[Bedriftsnavn]** | [Sted] | [Startdato] – [Sluttdato]

• [Oppnåelse]
• [Ansvar]
• [Resultat]

---

## UTDANNING

### [Grad/Utdannelse]
**[Utdanningsinstitusjon]** | [År]
[Relevante kurs, prosjekter eller karakterer hvis relevant]

---

## SERTIFISERINGER OG KURS
• [Sertifisering 1]
• [Kurs 2]

---

## SPRÅK
• Norsk: [Nivå]
• Engelsk: [Nivå]
• [Andre språk]

---

## REFERANSER
Oppgis ved forespørsel
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, coverLetterText, jobDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing CV optimization request');
    console.log('CV length:', cvText?.length || 0);
    console.log('Cover letter length:', coverLetterText?.length || 0);
    console.log('Job description length:', jobDescription?.length || 0);

    const systemPrompt = `Du er en ekspert CV-skribent og karriererådgiver spesialisert på det norske arbeidsmarkedet. 
Din oppgave er å optimalisere CV-er og søknadsbrev for å maksimere sjansen for å bli kalt inn til intervju.

VIKTIGE REGLER:
1. Behold all faktisk informasjon fra originalen (navn, kontaktinfo, arbeidshistorikk, utdanning)
2. Forbedre formuleringer og struktur
3. Fremhev relevante ferdigheter og erfaringer for den spesifikke stillingen
4. Bruk aktive verb og kvantifiserbare resultater hvor mulig
5. Tilpass språk og tone til norsk profesjonell standard
6. Sørg for ATS-vennlig formatering
7. Hold CV-en kortfattet (maks 2 sider)

CV-MAL SOM SKAL BRUKES:
${CV_TEMPLATE}

Du skal returnere en JSON-respons med følgende struktur:
{
  "optimizedCV": "den fullstendige optimaliserte CV-en i markdown-format",
  "coverLetter": "et fullstendig, profesjonelt søknadsbrev tilpasset stillingen",
  "analysis": {
    "keywords": ["liste over nøkkelord fra stillingsbeskrivelsen som er inkludert"],
    "values": ["verdier og kulturelle elementer som matches"],
    "strengths": ["styrker ved søknaden"],
    "improvements": ["forbedringer som ble gjort"]
  }
}`;

    const userPrompt = `Her er informasjonen jeg har:

ORIGINAL CV:
${cvText}

${coverLetterText ? `EKSISTERENDE SØKNADSBREV (brukes som utgangspunkt):
${coverLetterText}` : 'Ingen eksisterende søknadsbrev - lag et nytt fra bunnen.'}

STILLINGSBESKRIVELSE:
${jobDescription}

Vennligst:
1. Optimaliser CV-en basert på malen og stillingsbeskrivelsen
2. ${coverLetterText ? 'Forbedre det eksisterende søknadsbrevet' : 'Skriv et nytt søknadsbrev'} som matcher stillingen
3. Analyser matchingen mellom kandidaten og stillingen

Returner resultatet som JSON.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'For mange forespørsler. Vennligst vent litt og prøv igjen.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Kreditter oppbrukt. Kontakt administrator.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response received, parsing JSON...');
    
    // Parse the JSON response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw content:', content);
      
      // Fallback: create a structured response from the raw content
      result = {
        optimizedCV: content,
        coverLetter: 'Kunne ikke generere søknadsbrev. Vennligst prøv igjen.',
        analysis: {
          keywords: [],
          values: [],
          strengths: [],
          improvements: []
        }
      };
    }

    console.log('CV optimization completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimize-cv function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'En uventet feil oppstod' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
