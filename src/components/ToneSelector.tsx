
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export type ToneType = 'casual' | 'professional' | 'empathetic' | 'witty' | 'friendly';

interface ToneSelectorProps {
  selectedTone: ToneType;
  matchOriginalTone: boolean;
  onToneSelect: (tone: ToneType) => void;
  onMatchOriginalToneChange: (checked: boolean) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  matchOriginalTone,
  onToneSelect,
  onMatchOriginalToneChange,
}) => {
  const toneDescriptions = {
    casual: "Relaxed, conversational style with natural language",
    professional: "Academic style with proper APA citations and scholarly tone",
    empathetic: "Warm, understanding tone with thoughtful reflection",
    witty: "Clever observations with light humor and natural flow",
    friendly: "Conversational as if speaking to a friend"
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <Label className="text-sm font-medium mb-2 block">Select Tone</Label>
        <ToggleGroup type="single" value={selectedTone} onValueChange={(value) => value && onToneSelect(value as ToneType)}>
          {Object.entries(toneDescriptions).map(([tone, description]) => (
            <Tooltip key={tone}>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value={tone} 
                  className={`relative bg-tone-${tone}/20 hover:bg-tone-${tone}/40 data-[state=on]:bg-tone-${tone}`}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  {tone === 'professional' && (
                    <InfoIcon className="h-3 w-3 ml-1 inline-block text-gray-500" />
                  )}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                {description}
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
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
