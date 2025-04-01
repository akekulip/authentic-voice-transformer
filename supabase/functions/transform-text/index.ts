
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
          systemMessage += `Maintain a business-appropriate tone but with natural human touches like varied sentence structures, occasional parenthetical thoughts, and more organic transitions between ideas.`;
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
       - Rephrase and recombine sentences in creative ways. For example, turn "The sun rose. It was a beautiful morning." into "As the sun rose, it revealed a beautiful morning."
       - Actively vary sentence openings and avoid starting multiple sentences with the same words or structures
       - Introduce natural interruptions and informal connectors (like 'anyway', 'actually', 'you know', etc.)
    
    2. VOCABULARY SUBSTITUTION: 
       - Replace common words with less predictable synonyms that still maintain meaning
       - Avoid overused formal vocabulary and academic phrasing
       - Introduce occasional colloquialisms where appropriate
       - Mix precise terms with more general ones as humans naturally do
    
    3. PATTERN DISRUPTION:
       - Deliberately break any cadence, rhythm or repetitive patterns in paragraph structure
       - Vary punctuation styles naturally - mix dashes, parentheses, ellipses, and semicolons
       - Randomly include rhetorical questions in appropriate places
       - Create occasional sentence fragments or run-ons (like humans do in natural writing)
    
    4. ACTIVE VOICE AND PERSONAL LANGUAGE:
       - Convert passive voice to active voice when possible
       - Add personal references where appropriate ("I think", "in my view", etc.)
       - Include occasional implied emotional responses
       - Add subjective qualifiers ("probably", "seems like", "appears to be")
    
    5. HUMAN INCONSISTENCIES:
       - Introduce slight natural contradictions or self-corrections
       - Add conversational hedging phrases ("sort of", "kind of", "more or less")
       - Include minor exaggerations or generalizations that humans make
       - Occasionally restate points with subtle differences (as humans do when emphasizing)
       - Add harmless digressive thoughts in parentheses
    
    6. LENGTH MATCHING: Keep the transformed text within 5% of the original text's length.
    
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
        temperature: 0.92, // Slightly higher temperature for more creativity and human-like variations
        top_p: 0.92, // Allows for more diverse word selection
        presence_penalty: 0.7, // Stronger penalty to discourage repetitive patterns
        frequency_penalty: 0.8, // Stronger penalty to discourage using the same phrases
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
