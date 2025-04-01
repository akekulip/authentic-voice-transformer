
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export type ToneType = 'professional';

interface ToneSelectorProps {
  matchOriginalTone: boolean;
  onMatchOriginalToneChange: (checked: boolean) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
  matchOriginalTone,
  onMatchOriginalToneChange,
}) => {
  const toneDescription = "Academic style with proper APA citations and scholarly tone";

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center">
        <Label className="text-sm font-medium">Tone: </Label>
        <div className="ml-2 flex items-center px-3 py-1 bg-purple-light/30 text-purple-dark rounded-md">
          <span className="font-medium">Professional</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3 w-3 ml-1 inline-block text-gray-500" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[300px] text-xs">
              {toneDescription}
            </TooltipContent>
          </Tooltip>
        </div>
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
