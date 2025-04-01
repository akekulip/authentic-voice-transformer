
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
    const { text, tone, matchOriginalTone } = await req.json();

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing text transformation: tone=${tone}, matchOriginalTone=${matchOriginalTone}`);
    console.log(`Text length: ${text.length} characters`);

    if (!openAIApiKey) {
      console.error("OpenAI API key is not set");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Enhanced system message with more specific instructions on humanization techniques
    let systemMessage = `You are an expert at transforming text to sound 100% human-written. `;
    
    if (matchOriginalTone) {
      systemMessage += `Make subtle refinements to make the text sound more natural and genuinely human-written while preserving the original tone. `;
      systemMessage += `The changes should maintain the original style and formality level while adding human elements.`;
    } else {
      systemMessage += `Transform the following text to sound genuinely human-written in a ${tone} tone. `;
      
      switch (tone) {
        case 'casual':
          systemMessage += `Use a relaxed, conversational style with natural contractions and varied vocabulary. Include occasional filler words, self-corrections, or tangents as a real person would.`;
          break;
        case 'professional':
          systemMessage += `Create professional content with scholarly elements while maintaining human qualities. To sound authentic:
          - Maintain appropriate formal language but with minor natural variations
          - Structure arguments with clear topic sentences but vary paragraph structure naturally
          - Use conditional language appropriately ("may suggest," "appears to indicate")
          - Incorporate phrases like "The findings demonstrate" sparingly
          - Include occasional first-person plurals in appropriate contexts ("we can observe")
          - Vary sentence complexity - mix complex sentences with occasional simpler ones
          - Use passive voice strategically but not excessively
          - Include natural transitions between paragraphs that don't feel formulaic
          - IMPORTANT: DO NOT add citations, references, or attributions that weren't in the original text`;
          break;
        case 'empathetic':
          systemMessage += `Use a warm, understanding tone with natural fluctuations in empathy. Include thoughtful pauses, reflective questions, and personal touches.`;
          break;
        case 'witty':
          systemMessage += `Add clever observations and light humor with a natural flow. Include occasional tangential thoughts or witty asides that real humans naturally make.`;
          break;
        case 'friendly':
          systemMessage += `Write conversationally as if speaking to a friend, with warm tone, natural asides, and references that make the text feel like a real person-to-person interaction.`;
          break;
        default:
          systemMessage += `Make it sound natural and distinctly human with varied sentence patterns and word choices.`;
      }
    }

    // Significantly enhanced humanization instructions
    systemMessage += ` 
    CRITICAL REQUIREMENTS to ensure this text passes ALL AI detection tools:
    
    1. SENTENCE TRANSFORMATION: 
       - Actively rephrase complete sentences into different structures. For example, change "AI detection is a problem. Many writers face it." into "Many writers struggle with the problem of AI detection."
       - Introduce sentence fragments occasionally - real humans don't always write complete sentences
       - Vary sentence openings aggressively - analyze and ensure diverse starting words
       - Connect ideas in unpredictable ways using conjunctions like "yet", "although", or "meanwhile"
    
    2. VOCABULARY SUBSTITUTION: 
       - Replace predictable terms with unexpected synonyms or colloquial alternatives
       - Mix formal words with casual expressions, even in professional writing (humans are inconsistent)
       - Introduce minor typos or word choice quirks that a human might make (1-2 per lengthy text)
       - Avoid academic/essay-style phrasing that AI typically produces
    
    3. PATTERN DISRUPTION:
       - Create deliberately uneven paragraph lengths
       - Insert mid-sentence dashes, parenthetical thoughts, or even ellipses...just like a person might
       - Occasionally use subtle emphasis markers like italics or ALL CAPS for a word or phrase
       - Break expected writing patterns by occasionally asking a question or making an exclamation
    
    4. HUMAN VOICE ELEMENTS:
       - Add personal perspective markers like "honestly," "I'd say," or "in my experience" 
       - Insert conversational hedges like "sort of" or "kind of" even in professional contexts
       - Include small thinking-out-loud moments ("now that I think about it...")
       - Express mild uncertainty or reconsideration of points made earlier
    
    5. AUTHENTIC IRREGULARITIES:
       - Create minor logical inconsistencies that reflect human thought processes
       - Use informal punctuation occasionally, like dashes instead of semicolons
       - Include subtle self-corrections or refinements of earlier statements
       - Allow some natural repetition of ideas but with different phrasing
    
    6. LENGTH CONTROL: Keep the transformed text within 5% of the original text's length to avoid detection.
    
    7. DO NOT ADD CITATIONS NOT IN THE ORIGINAL TEXT. If the original text doesn't include citations, don't add them.
    
    The text MUST appear to be written by a human, with all the natural irregularities and variations that entails. DO NOT explain or comment on your transformations - return ONLY the transformed text.`;

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
        temperature: 0.95, // Higher temperature for more creativity and unpredictability
        top_p: 0.95, // Allows for more diverse word selection
        presence_penalty: 0.8, // Stronger penalty to discourage repetitive patterns
        frequency_penalty: 0.9, // Stronger penalty to discourage using the same phrases
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
