
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

    // Enhanced system message for more human-like text
    let systemMessage = `You are an expert at transforming text to sound 100% human-written while maintaining approximately the same length as the original text. `;
    
    if (matchOriginalTone) {
      systemMessage += `Make subtle refinements to make the text sound more natural and genuinely human-written while preserving the original tone. `;
      systemMessage += `The changes should be minimal yet effective, maintaining the original style, length and formality level.`;
    } else {
      systemMessage += `Transform the following text to sound genuinely human-written in a ${tone} tone while keeping approximately the same length. `;
      
      switch (tone) {
        case 'casual':
          systemMessage += `Use contractions, simpler vocabulary, a relaxed structure, and occasional conversational fillers (um, like, you know) where appropriate. Add human imperfections and varied sentence patterns.`;
          break;
        case 'professional':
          systemMessage += `Maintain a business-appropriate tone with clear language, but add subtle human touches. Vary sentence length, use transitional phrases naturally, and include occasional parenthetical expressions.`;
          break;
        case 'empathetic':
          systemMessage += `Use warm, understanding language that acknowledges emotions with natural variations in emphasis. Include thoughtful pauses, reflective questions, and personal touches that a real human would use.`;
          break;
        case 'witty':
          systemMessage += `Add clever wordplay, light humor, and engaging expressions that sound natural, not forced. Include occasional tangential thoughts or asides that a witty person might actually make.`;
          break;
        case 'friendly':
          systemMessage += `Write as if speaking to a friend, with a warm tone, using colloquialisms, personal anecdotes, and references that make the text feel like a real conversation.`;
          break;
        default:
          systemMessage += `Make it sound natural, conversational and distinctly human.`;
      }
    }

    // Additional instructions for human-like qualities and avoiding AI detection
    systemMessage += ` 
    Important: The transformed text MUST pass AI detection tools and appear 100% human-written:
    1. Vary sentence structure, length, and complexity naturally (short, medium, and long)
    2. Include subtle human inconsistencies and imperfections (occasional wordiness, thoughtful pauses, self-corrections)
    3. Use natural speech patterns with contractions, fillers, and conversational connectors
    4. Avoid perfectly balanced arguments and overly consistent paragraph structures
    5. Include conversational touches like rhetorical questions, personal opinions, or light digressions
    6. Maintain the approximate original text length (±10%)
    7. Add personality through occasional idioms, analogies, or cultural references when appropriate
    
    Return ONLY the transformed text without any explanations, introductions, or commentary.`;

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
        temperature: matchOriginalTone ? 0.7 : 0.9, // Higher temperature for more creativity and human-like variations
        presence_penalty: 0.2, // Slight penalty to discourage repetitive patterns
        frequency_penalty: 0.3, // Discourages using the same phrases too often
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const transformedText = data.choices[0].message.content.trim();
    
    console.log(`Successfully transformed text. Original length: ${text.length}, New length: ${transformedText.length}`);
    console.log(`Length difference: ${Math.abs(text.length - transformedText.length)} characters (${Math.round(Math.abs(text.length - transformedText.length) / text.length * 100)}%)`);

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
