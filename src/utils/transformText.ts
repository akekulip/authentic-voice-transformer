
import { ToneType } from '@/components/ToneSelector';
import { supabase } from '@/integrations/supabase/client';

export const transformText = async (
  text: string, 
  tone: ToneType, 
  matchOriginalTone: boolean
): Promise<string> => {
  if (!text.trim()) return '';
  
  try {
    const { data, error } = await supabase.functions.invoke('transform-text', {
      body: { text, tone, matchOriginalTone }
    });
    
    if (error) {
      console.error('Error calling transform-text function:', error);
      throw new Error(`Failed to transform text: ${error.message}`);
    }
    
    if (data.error) {
      console.error('Error from transform-text function:', data.error);
      throw new Error(`Failed to transform text: ${data.error}`);
    }
    
    return data.transformedText || '';
  } catch (error) {
    console.error('Error in transformText:', error);
    throw error;
  }
};
