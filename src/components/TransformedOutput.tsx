
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface TransformedOutputProps {
  transformedText: string;
  isLoading: boolean;
}

const TransformedOutput: React.FC<TransformedOutputProps> = ({ transformedText, isLoading }) => {
  const { toast } = useToast();
  const [aiProbability, setAiProbability] = useState<number | null>(null);
  const [aiDetectionLoading, setAiDetectionLoading] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'low' | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transformedText);
    toast({
      title: "Copied!",
      description: "Transformed text copied to clipboard.",
      duration: 2000,
    });
  };

  // Check if text likely contains citations (simple heuristic)
  const containsCitations = transformedText && 
    (/\(\d{4}\)/.test(transformedText) || // Pattern like (2022)
     /et al\.,? \d{4}/.test(transformedText) || // Pattern like et al., 2022
     /\([^)]+, \d{4}[^)]*\)/.test(transformedText)); // Pattern like (Smith, 2022)
  
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

  return (
    <Card className="h-full shadow-md animate-fade-in">
      <CardHeader className="bg-purple-light/30 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle className="text-lg font-medium text-purple-dark">Humanized Text</CardTitle>
          {containsCitations && transformedText && (
            <div className="ml-2 px-2 py-0.5 bg-purple/20 text-purple text-xs rounded-full flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              APA Style
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyToClipboard} 
          disabled={!transformedText || isLoading}
          className="h-8 px-2"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </CardHeader>
      <CardContent className="p-3">
        <div className="min-h-[400px] p-3 rounded-md bg-white border text-sm leading-relaxed overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-purple-dark">Transforming...</div>
            </div>
          ) : transformedText ? (
            <>
              {transformedText}
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
