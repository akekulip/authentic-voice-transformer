
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <Label className="text-sm font-medium mb-2 block">Select Tone</Label>
        <ToggleGroup type="single" value={selectedTone} onValueChange={(value) => value && onToneSelect(value as ToneType)}>
          <ToggleGroupItem value="casual" className="relative bg-tone-casual/20 hover:bg-tone-casual/40 data-[state=on]:bg-tone-casual">
            Casual
          </ToggleGroupItem>
          <ToggleGroupItem value="professional" className="relative bg-tone-professional/20 hover:bg-tone-professional/40 data-[state=on]:bg-tone-professional">
            Professional
          </ToggleGroupItem>
          <ToggleGroupItem value="empathetic" className="relative bg-tone-empathetic/20 hover:bg-tone-empathetic/40 data-[state=on]:bg-tone-empathetic">
            Empathetic
          </ToggleGroupItem>
          <ToggleGroupItem value="witty" className="relative bg-tone-witty/20 hover:bg-tone-witty/40 data-[state=on]:bg-tone-witty">
            Witty
          </ToggleGroupItem>
          <ToggleGroupItem value="friendly" className="relative bg-tone-friendly/20 hover:bg-tone-friendly/40 data-[state=on]:bg-tone-friendly">
            Friendly
          </ToggleGroupItem>
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
