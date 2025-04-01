
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, tone, matchOriginalTone, preserveCitations } = await req.json();

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing text transformation: tone=${tone}, matchOriginalTone=${matchOriginalTone}, preserveCitations=${preserveCitations}`);
    console.log(`Text length: ${text.length} characters`);

    if (!openAIApiKey) {
      console.error("OpenAI API key is not set");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Enhanced system message with instructions for formal academic tone
    let systemMessage = `You are an expert at transforming text to sound authentically human-written in a formal academic style while preserving the academic integrity. `;
    
    if (matchOriginalTone) {
      systemMessage += `Make subtle refinements to make the text sound more natural and genuinely human-written while preserving the original tone and academic structure. `;
      systemMessage += `The changes should maintain the original style and formality level while adding human elements.`;
    } else {
      systemMessage += `Transform the following text to sound genuinely human-written in a formal academic tone. `;
      
      systemMessage += `Create scholarly content with academic elements while maintaining human qualities. To sound authentic:
      - Maintain appropriate formal language but with minor natural variations
      - Structure arguments with clear topic sentences but vary paragraph structure naturally
      - Use conditional language appropriately ("may suggest," "appears to indicate")
      - Incorporate scholarly phrases like "The findings demonstrate" where appropriate
      - Include occasional first-person plurals in appropriate contexts ("we can observe")
      - Vary sentence complexity - mix complex sentences with occasional simpler ones
      - Use passive voice strategically but not excessively
      - Include natural transitions between paragraphs that don't feel formulaic`;
    }
    
    // Citation handling instructions
    systemMessage += `
    CRITICAL INSTRUCTIONS FOR CITATIONS:
    - PRESERVE ALL EXISTING CITATIONS from the original text exactly as they appear (e.g., Smith et al., 2019)
    - DO NOT ADD ANY NEW CITATIONS that weren't in the original text
    - DO NOT INVENT OR FABRICATE any references or sources
    - If the original text has in-text citations like (Smith, 2020) or [1], maintain them in their exact format
    - If the original text has no citations, do not add any`;

    // Significantly enhanced humanization instructions
    systemMessage += ` 
    CRITICAL REQUIREMENTS to ensure this text passes ALL AI detection tools while maintaining academic integrity:
    
    1. SENTENCE TRANSFORMATION: 
       - Actively rephrase complete sentences into different academic structures
       - Vary sentence openings and length within formal academic standards
       - Connect ideas using scholarly transitional phrases
       - Maintain academic precision while varying expression
    
    2. VOCABULARY SUBSTITUTION: 
       - Replace predictable terms with unexpected but academically appropriate alternatives
       - Avoid overly formulaic academic phrasing that AI typically produces
       - Introduce minor variations in word choice that a human academic might make
       - Keep specialized terminology consistent
    
    3. PATTERN DISRUPTION:
       - Create deliberately varied paragraph lengths that still adhere to academic standards
       - Include appropriate use of em-dashes, semicolons, and parenthetical statements
       - Break expected writing patterns while maintaining scholarly tone
       - Use occasional rhetorical questions when appropriate in academic context
    
    4. HUMAN VOICE ELEMENTS:
       - Add subtle perspective markers appropriate in academic writing
       - Include scholarly hedging like "it appears that" or "evidence suggests"
       - Express measured qualification of points made earlier
       - Incorporate thoughtful nuance in arguments
    
    5. AUTHENTIC ACADEMIC IRREGULARITIES:
       - Create minor logical progressions that reflect human thought processes
       - Allow some natural repetition of key concepts with different phrasing
       - Include occasional self-references to previous points in the text
       - Maintain formal tone while introducing subtle variations in style
    
    6. LENGTH CONTROL: Keep the transformed text within 5% of the original text's length to avoid detection.
    
    The text MUST appear to be written by a human academic, with all the natural irregularities and variations that entails while maintaining scholarly standards. DO NOT explain or comment on your transformations - return ONLY the transformed text.`;

    console.log("Sending request to OpenAI");

    // Make the API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using the more advanced model for better human-like transformations
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: text }
        ],
        temperature: 0.85, // Balanced temperature for academic writing (natural but not too creative)
        top_p: 0.92, // Slightly more diverse word selection while maintaining formality
        presence_penalty: 0.7, // Moderate penalty to discourage repetitive patterns
        frequency_penalty: 0.8, // Moderate penalty to discourage using the same phrases
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const transformedText = data.choices[0].message.content.trim();
    
    // Verify length similarity
    const lengthDifference = Math.abs(text.length - transformedText.length);
    const percentDifference = (lengthDifference / text.length) * 100;
    
    console.log(`Successfully transformed text. Original length: ${text.length}, New length: ${transformedText.length}`);
    console.log(`Length difference: ${lengthDifference} characters (${percentDifference.toFixed(1)}%)`);

    if (percentDifference > 10) {
      console.warn(`Warning: Length difference exceeds 10% (${percentDifference.toFixed(1)}%)`);
    }

    return new Response(
      JSON.stringify({ transformedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transform-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
