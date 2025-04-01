
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

    // Prepare the system message based on the selected tone and whether to match original tone
    let systemMessage = `You are an expert at transforming text to sound more natural and human. `;
    
    if (matchOriginalTone) {
      systemMessage += `Make subtle refinements to make the text sound more natural while preserving the original tone. `;
      systemMessage += `The changes should be minimal but impactful, maintaining the overall style and formality of the original text.`;
    } else {
      systemMessage += `Transform the following text to sound natural and conversational in a ${tone} tone. `;
      
      switch (tone) {
        case 'casual':
          systemMessage += `Use contractions, simpler vocabulary, and a relaxed structure. Include occasional informal expressions and a conversational flow.`;
          break;
        case 'professional':
          systemMessage += `Maintain a business-appropriate tone with clear, concise language. Be formal but not overly stiff, and ensure the text conveys competence and authority.`;
          break;
        case 'empathetic':
          systemMessage += `Use warm, understanding language that acknowledges emotions. Include supportive phrases and a compassionate tone.`;
          break;
        case 'witty':
          systemMessage += `Add clever wordplay, light humor, and engaging expressions. Be smart but not sarcastic, with a touch of playfulness.`;
          break;
        case 'friendly':
          systemMessage += `Write as if speaking to a friend, with a warm, inviting tone. Use simple language, personal touches, and an upbeat attitude.`;
          break;
        default:
          systemMessage += `Make it sound natural and conversational.`;
      }
    }

    // Add specific instructions for the transformation
    systemMessage += ` Improve the text by:
    1. Using natural contractions where appropriate (e.g., "don't" instead of "do not")
    2. Varying sentence structure and length
    3. Adding transition words for flow
    4. Using more active voice
    5. Incorporating conversational phrases and expressions
    6. Removing overly formal or robotic language
    
    Return ONLY the transformed text without any explanations, introductions, or commentary.`;

    console.log("Sending to OpenAI with system message:", systemMessage);

    // Make the API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more capable but cost-effective model
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: text }
        ],
        temperature: matchOriginalTone ? 0.3 : 0.7, // Lower temperature for matching original tone
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const transformedText = data.choices[0].message.content.trim();

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
