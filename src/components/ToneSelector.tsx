
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export type ToneType = 'professional' | 'casual' | 'friendly' | 'witty' | 'empathetic';

interface ToneSelectorProps {
  tone: ToneType;
  onToneChange: (tone: ToneType) => void;
  matchOriginalTone: boolean;
  onMatchOriginalToneChange: (checked: boolean) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
  tone,
  onToneChange,
  matchOriginalTone,
  onMatchOriginalToneChange,
}) => {
  const toneDescriptions = {
    professional: "Formal and structured academic style without adding citations",
    casual: "Relaxed, conversational style with natural flow",
    friendly: "Warm tone as if speaking to a friend",
    witty: "Clever with subtle humor and personality",
    empathetic: "Understanding and supportive tone"
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <Label className="text-sm font-medium mb-2 block">Tone Style:</Label>
        <RadioGroup value={tone} onValueChange={(value) => onToneChange(value as ToneType)} className="flex flex-wrap gap-2">
          {(Object.keys(toneDescriptions) as ToneType[]).map((toneType) => (
            <div key={toneType} className="flex items-center space-x-1">
              <RadioGroupItem value={toneType} id={`tone-${toneType}`} />
              <Label htmlFor={`tone-${toneType}`} className="text-sm capitalize flex items-center">
                {toneType}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-3 w-3 ml-1 inline-block text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[300px] text-xs">
                      {toneDescriptions[toneType]}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="matchTone" 
          checked={matchOriginalTone} 
          onCheckedChange={(checked) => onMatchOriginalToneChange(!!checked)} 
        />
        <Label htmlFor="matchTone" className="text-sm font-normal">Match original tone (subtle refinement only)</Label>
      </div>
    </div>
  );
};

export default ToneSelector;
