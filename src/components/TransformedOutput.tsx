
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, FileText, AlertTriangle, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface TransformedOutputProps {
  transformedText: string;
  isLoading: boolean;
}

const TransformedOutput: React.FC<TransformedOutputProps> = ({ transformedText, isLoading }) => {
  const { toast } = useToast();
  const [aiProbability, setAiProbability] = useState<number | null>(null);
  const [aiDetectionLoading, setAiDetectionLoading] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'low' | null>(null);
  const [savedTexts, setSavedTexts] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedTransformedTexts');
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Fake progress bar for better UX during loading
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isLoading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const increment = Math.random() * 15;
          const newValue = prev + increment;
          // Cap at 90% to avoid giving false impression of completion
          return newValue > 90 ? 90 : newValue;
        });
      }, 600);
    } else {
      setLoadingProgress(100);
    }

    // Cleanup function
    return () => {
      if (interval) clearInterval(interval);
      if (!isLoading) {
        // This setTimeout doesn't need to return anything
        setTimeout(() => setLoadingProgress(0), 1000);
      }
    };
  }, [isLoading]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transformedText);
    toast({
      title: "Copied!",
      description: "Transformed text copied to clipboard.",
      duration: 2000,
    });
  };

  const saveText = () => {
    if (!transformedText) return;
    
    const updatedSavedTexts = [...savedTexts, transformedText];
    setSavedTexts(updatedSavedTexts);
    localStorage.setItem('savedTransformedTexts', JSON.stringify(updatedSavedTexts));
    
    toast({
      title: "Saved!",
      description: "Text saved to your local collection.",
      duration: 2000,
    });
  };

  const downloadAsTextFile = () => {
    if (!transformedText) return;
    
    const blob = new Blob([transformedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `humanized-text-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Text file has been downloaded.",
      duration: 2000,
    });
  };
  
  useEffect(() => {
    // Reset AI detection when new text is transformed
    if (transformedText && !isLoading) {
      detectAiContent();
    } else {
      setAiProbability(null);
      setConfidenceLevel(null);
    }
  }, [transformedText, isLoading]);

  const detectAiContent = async () => {
    if (!transformedText || transformedText.length < 50) return;
    
    setAiDetectionLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('detect-ai-content', {
        body: { text: transformedText }
      });
      
      if (error) {
        console.error('Error detecting AI content:', error);
        throw error;
      }
      
      setAiProbability(data.aiProbability);
      
      // Set confidence level based on probability value
      if (data.confidence === 'high') {
        setConfidenceLevel('high');
      } else if (data.confidence === 'medium') {
        setConfidenceLevel('medium');
      } else {
        setConfidenceLevel('low');
      }
      
    } catch (error) {
      console.error('AI detection failed:', error);
      toast({
        title: "AI Detection Failed",
        description: "Couldn't analyze the text for AI probability.",
        variant: "destructive",
      });
    } finally {
      setAiDetectionLoading(false);
    }
  };

  const getAIProbabilityColor = () => {
    if (aiProbability === null) return 'bg-gray-300';
    if (aiProbability < 15) return 'bg-green-500';
    if (aiProbability < 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAIMessage = () => {
    if (aiProbability === null) return '';
    
    if (aiProbability < 15) {
      return 'Likely human-written';
    } else if (aiProbability < 40) {
      return 'May contain AI elements';
    } else {
      return 'Likely AI-generated';
    }
  };

  const getConfidenceBadge = () => {
    if (!confidenceLevel) return null;
    
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${colors[confidenceLevel]}`}>
        {confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)} confidence
      </span>
    );
  };

  // Calculate statistics about the text
  const getTextStatistics = () => {
    if (!transformedText) return null;
    
    const words = transformedText.trim().split(/\s+/).length;
    const sentences = transformedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = transformedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return (
      <div className="flex space-x-3 text-xs text-gray-500 mt-2">
        <div>{transformedText.length} characters</div>
        <div>{words} words</div>
        <div>{sentences} sentences</div>
        <div>{paragraphs} paragraphs</div>
      </div>
    );
  };

  return (
    <Card className="h-full shadow-md animate-fade-in">
      <CardHeader className="bg-purple-light/30 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle className="text-lg font-medium text-purple-dark">Humanized Text</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={saveText} 
            disabled={!transformedText || isLoading}
            className="h-8 px-2"
            title="Save to collection"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadAsTextFile} 
            disabled={!transformedText || isLoading}
            className="h-8 px-2"
            title="Download as text file"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToClipboard} 
            disabled={!transformedText || isLoading}
            className="h-8 px-2"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {loadingProgress > 0 && (
          <div className="w-full mb-2">
            <Progress value={loadingProgress} className="h-1" />
          </div>
        )}
        <div className="min-h-[400px] p-3 rounded-md bg-white border text-sm leading-relaxed overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-purple-dark">Transforming...</div>
            </div>
          ) : transformedText ? (
            <>
              {transformedText}
              {getTextStatistics()}
              {aiProbability !== null && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">AI Detection</span>
                      {getConfidenceBadge()}
                    </div>
                    <span className="text-sm font-medium">{aiProbability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getAIProbabilityColor()}`} 
                      style={{ width: `${aiProbability}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-600">
                    {aiProbability > 40 && <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />}
                    {getAIMessage()}
                  </div>
                </div>
              )}
              {aiDetectionLoading && (
                <div className="mt-4 text-center text-xs text-gray-500">
                  Analyzing text for AI probability...
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground italic">
              Transformed text will appear here...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransformedOutput;
