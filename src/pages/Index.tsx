
import React, { useState, useEffect } from 'react';
import TextInput from '@/components/TextInput';
import ToneSelector, { ToneType } from '@/components/ToneSelector';
import TransformedOutput from '@/components/TransformedOutput';
import FeedbackButtons from '@/components/FeedbackButtons';
import { Button } from '@/components/ui/button';
import { transformText } from '@/utils/transformText';
import { Wand2 } from 'lucide-react';

const Index = () => {
  const [originalText, setOriginalText] = useState('');
  const [transformedText, setTransformedText] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('casual');
  const [matchOriginalTone, setMatchOriginalTone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  // Debounce text transformation when original text changes
  useEffect(() => {
    if (!originalText.trim()) {
      setTransformedText('');
      return;
    }
    
    const timer = setTimeout(() => {
      handleTransform();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [originalText, selectedTone, matchOriginalTone]);

  const handleTransform = async () => {
    if (!originalText.trim()) return;
    
    setIsLoading(true);
    setHasFeedback(false);
    
    try {
      const result = await transformText(originalText, selectedTone, matchOriginalTone);
      setTransformedText(result);
    } catch (error) {
      console.error('Error transforming text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (isPositive: boolean) => {
    // In a real app, we would send this feedback to a server
    console.log('Feedback:', isPositive ? 'positive' : 'negative');
    setHasFeedback(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-purple-dark">
              Authentic Voice Transformer
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Transform AI-generated, formal, or robotic text into natural, human-sounding content
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
            <ToneSelector
              selectedTone={selectedTone}
              matchOriginalTone={matchOriginalTone}
              onToneSelect={setSelectedTone}
              onMatchOriginalToneChange={setMatchOriginalTone}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Button 
                onClick={handleTransform}
                disabled={!originalText.trim() || isLoading}
                className="bg-purple hover:bg-purple-dark w-full md:w-auto"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Transform Now
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
          <p>Authentic Voice Transformer • Make your content sound human</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
