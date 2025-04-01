
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string' || text.length < 50) {
      return new Response(
        JSON.stringify({ 
          error: "Text is required and must be at least 50 characters" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Simple AI detection algorithm based on text characteristics
    // This is a simplified version for demonstration purposes
    // In a real application, you would use a more sophisticated model
    
    // Calculate metrics
    const metrics = calculateTextMetrics(text);
    
    // Calculate probability based on metrics (returns 0-100)
    const aiProbability = calculateAIProbability(metrics);
    
    // Determine confidence level
    const confidence = determineConfidenceLevel(text.length, metrics);
    
    console.log(`AI detection result: ${aiProbability}% with ${confidence} confidence`);
    
    return new Response(
      JSON.stringify({ 
        aiProbability, 
        confidence,
        metrics // Include metrics for debugging
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-ai-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calculate various text metrics
function calculateTextMetrics(text: string) {
  // Normalize text
  const normalizedText = text.toLowerCase();
  const words = normalizedText.match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // 1. Measure lexical diversity (unique words / total words)
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  // 2. Sentence length variation (standard deviation of sentence lengths)
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
  const sentenceLengthVariation = Math.sqrt(
    sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length
  );
  
  // 3. Measure contractions usage (common in human text)
  const contractionRegex = /\b(can't|won't|don't|isn't|aren't|you're|they're|we're|i'm|he's|she's|it's|that's|let's)\b/gi;
  const contractions = text.match(contractionRegex) || [];
  const contractionRate = contractions.length / sentences.length;
  
  // 4. Check for filler words/phrases (common in human text)
  const fillerWords = ['actually', 'basically', 'honestly', 'like', 'literally', 'sort of', 'kind of', 'you know', 'i mean', 'well'];
  const fillerCount = fillerWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex) || [];
    return count + matches.length;
  }, 0);
  const fillerRate = fillerCount / sentences.length;
  
  // 5. Count passive voice instances (often higher in AI text)
  const passiveRegex = /\b(was|were|been|be|being)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passiveRegex) || [];
  const passiveRate = passiveMatches.length / sentences.length;
  
  // 6. Measure sentence starters repetition (AI tends to be more repetitive)
  const sentenceStarters = sentences.map(s => {
    const words = s.trim().split(/\s+/);
    return words.length > 0 ? words[0].toLowerCase() : '';
  }).filter(w => w.length > 0);
  
  const uniqueStarters = new Set(sentenceStarters);
  const starterDiversity = uniqueStarters.size / sentenceStarters.length;
  
  return {
    lexicalDiversity,
    sentenceLengthVariation,
    contractionRate,
    fillerRate,
    passiveRate,
    starterDiversity,
    wordCount: words.length,
    sentenceCount: sentences.length
  };
}

// Calculate AI probability (0-100) based on metrics
function calculateAIProbability(metrics: any) {
  // Weightings for each metric (adjust these based on effectiveness)
  const weights = {
    lexicalDiversity: -25,  // Higher diversity -> more human-like (-25 points if very diverse)
    sentenceLengthVariation: -20, // Higher variation -> more human-like
    contractionRate: -15,   // More contractions -> more human-like
    fillerRate: -10,       // More fillers -> more human-like
    passiveRate: 15,       // More passive voice -> more AI-like
    starterDiversity: -15  // Higher starter diversity -> more human-like
  };
  
  // Base score (starting point)
  let score = 50;
  
  // Adjust score based on lexical diversity (unique words ratio)
  if (metrics.lexicalDiversity > 0.7) score += weights.lexicalDiversity * 1.0;
  else if (metrics.lexicalDiversity > 0.5) score += weights.lexicalDiversity * 0.7;
  else if (metrics.lexicalDiversity < 0.4) score -= weights.lexicalDiversity * 1.2;
  
  // Adjust for sentence length variation
  if (metrics.sentenceLengthVariation > 4) score += weights.sentenceLengthVariation * 1.0;
  else if (metrics.sentenceLengthVariation < 2) score -= weights.sentenceLengthVariation * 1.2;
  
  // Adjust for contractions
  if (metrics.contractionRate > 0.4) score += weights.contractionRate * 1.0;
  else if (metrics.contractionRate < 0.1) score -= weights.contractionRate * 1.2;
  
  // Adjust for filler words/phrases
  if (metrics.fillerRate > 0.3) score += weights.fillerRate * 1.0;
  else if (metrics.fillerRate < 0.05) score -= weights.fillerRate * 1.2;
  
  // Adjust for passive voice
  if (metrics.passiveRate > 0.3) score += weights.passiveRate * 1.0;
  
  // Adjust for sentence starter diversity
  if (metrics.starterDiversity > 0.8) score += weights.starterDiversity * 1.0;
  else if (metrics.starterDiversity < 0.4) score -= weights.starterDiversity * 1.2;
  
  // Ensure the score is within 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  // Round to nearest integer
  return Math.round(score);
}

// Determine the confidence level of the AI prediction
function determineConfidenceLevel(textLength: number, metrics: any): 'high' | 'medium' | 'low' {
  // For very short texts, confidence is low
  if (textLength < 200) return 'low';
  
  // For longer texts with clear metrics, confidence is higher
  if (textLength > 500 && 
      (metrics.lexicalDiversity < 0.35 || metrics.lexicalDiversity > 0.75) &&
      (metrics.sentenceLengthVariation < 1.5 || metrics.sentenceLengthVariation > 5)) {
    return 'high';
  }
  
  // Medium confidence for texts with moderate length and some clear indicators
  if (textLength > 300 && 
      (metrics.contractionRate < 0.05 || metrics.contractionRate > 0.5 ||
       metrics.starterDiversity < 0.3 || metrics.starterDiversity > 0.8)) {
    return 'medium';
  }
  
  // Default to low confidence
  return 'low';
}
