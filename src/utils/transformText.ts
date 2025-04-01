
import { ToneType } from '@/components/ToneSelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const transformText = async (
  text: string, 
  tone: ToneType, 
  matchOriginalTone: boolean
): Promise<string> => {
  if (!text.trim()) return '';
  
  try {
    console.log(`Calling transform-text function with: tone=${tone}, matchOriginalTone=${matchOriginalTone}`);
    
    const { data, error } = await supabase.functions.invoke('transform-text', {
      body: { text, tone, matchOriginalTone }
    });
    
    if (error) {
      console.error('Error calling transform-text function:', error);
      toast({
        title: "Transformation failed",
        description: `Failed to transform text: ${error.message}`,
        variant: "destructive",
      });
      throw new Error(`Failed to transform text: ${error.message}`);
    }
    
    if (data.error) {
      console.error('Error from transform-text function:', data.error);
      toast({
        title: "Transformation failed",
        description: `Failed to transform text: ${data.error}`,
        variant: "destructive",
      });
      throw new Error(`Failed to transform text: ${data.error}`);
    }
    
    // Verify the transformed text length is similar to the original
    const lengthDifference = Math.abs(text.length - data.transformedText.length);
    const percentDifference = (lengthDifference / text.length) * 100;
    
    if (percentDifference > 10) {
      console.warn(`Warning: Transformed text length differs by ${percentDifference.toFixed(1)}% from original`);
      toast({
        title: "Length Difference",
        description: `The transformed text length differs by ${percentDifference.toFixed(1)}% from the original.`,
        variant: "default",
      });
    }
    
    return data.transformedText || '';
  } catch (error) {
    console.error('Error in transformText:', error);
    toast({
      title: "Transformation failed",
      description: "An unexpected error occurred while transforming the text.",
      variant: "destructive",
    });
    throw error;
  }
};
