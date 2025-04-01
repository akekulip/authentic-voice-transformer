
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransformedOutputProps {
  transformedText: string;
  isLoading: boolean;
}

const TransformedOutput: React.FC<TransformedOutputProps> = ({ transformedText, isLoading }) => {
  const { toast } = useToast();

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
            transformedText
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
