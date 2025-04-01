
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange }) => {
  return (
    <Card className="h-full shadow-md animate-fade-in">
      <CardHeader className="bg-purple-light/30 pb-2">
        <CardTitle className="text-lg font-medium text-purple-dark">Original Text</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Textarea
          placeholder="Paste your AI-generated or formal text here..."
          className="min-h-[400px] resize-none text-sm leading-relaxed focus-visible:ring-purple"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
};

export default TextInput;
