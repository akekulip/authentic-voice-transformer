
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export type ToneType = 'formal';

interface ToneSelectorProps {
  matchOriginalTone: boolean;
  onMatchOriginalToneChange: (checked: boolean) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
  matchOriginalTone,
  onMatchOriginalToneChange,
}) => {
  const toneDescription = "Formal and structured academic style that maintains original citations without adding new ones";

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <Label className="text-sm font-medium mb-2 flex items-center">
          Academic Tone
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 ml-1 inline-block text-gray-500" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[300px] text-xs">
                {toneDescription}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
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
