
import React, { useState, useEffect } from 'react';
import TextInput from '@/components/TextInput';
import ToneSelector, { ToneType } from '@/components/ToneSelector';
import TransformedOutput from '@/components/TransformedOutput';
import FeedbackButtons from '@/components/FeedbackButtons';
import SavedTransforms from '@/components/SavedTransforms';
import { Button } from '@/components/ui/button';
import { transformText } from '@/utils/transformText';
import { Wand2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [originalText, setOriginalText] = useState('');
  const [transformedText, setTransformedText] = useState('');
  const [tone, setTone] = useState<ToneType>('professional'); // Changed default to professional
  const [matchOriginalTone, setMatchOriginalTone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  // Clear transformed text when original text changes
  useEffect(() => {
    if (!originalText.trim()) {
      setTransformedText('');
    }
  }, [originalText]);

  const handleTransform = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No text to transform",
        description: "Please enter some text to transform.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setHasFeedback(false);
    setTransformedText(''); // Clear previous result while loading
    
    try {
      console.log('Starting text transformation...');
      const result = await transformText(originalText, tone, matchOriginalTone);
      setTransformedText(result);
      toast({
        title: "Transformation complete!",
        description: "Your text has been transformed with natural human variation to bypass AI detection.",
      });
      console.log('Text transformation completed successfully.');
    } catch (error) {
      console.error('Error transforming text:', error);
      // Error notification is handled in the transformText function
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (isPositive: boolean) => {
    // In a real app, we would send this feedback to a server
    console.log('Feedback:', isPositive ? 'positive' : 'negative');
    setHasFeedback(true);
    toast({
      title: "Thank you for your feedback!",
      description: isPositive ? "We're glad you liked the result." : "We'll work on improving our transformations.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-purple-dark">
              Text Humanizer
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Transform AI-generated text into 100% human-sounding content that bypasses AI detection
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput 
            value={originalText} 
            onChange={setOriginalText} 
          />
          
          <TransformedOutput 
            transformedText={transformedText} 
            isLoading={isLoading} 
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <ToneSelector
                tone={tone}
                onToneChange={setTone}
                matchOriginalTone={matchOriginalTone}
                onMatchOriginalToneChange={setMatchOriginalTone}
              />
              <SavedTransforms />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Button 
                onClick={handleTransform}
                disabled={!originalText.trim() || isLoading}
                className="bg-purple hover:bg-purple-dark w-full md:w-auto"
              >
                <Wand2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Transforming...' : 'Transform Now'}
              </Button>
              
              <FeedbackButtons 
                onFeedback={handleFeedback}
                disabled={!transformedText || isLoading || hasFeedback}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto py-6 text-center text-sm text-gray-500">
          <p>Text Humanizer • Make your content sound authentically human</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
