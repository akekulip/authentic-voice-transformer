
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackButtonsProps {
  onFeedback: (isPositive: boolean) => void;
  disabled: boolean;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ onFeedback, disabled }) => {
  const { toast } = useToast();

  const handleFeedback = (isPositive: boolean) => {
    onFeedback(isPositive);
    toast({
      title: "Thanks for your feedback!",
      description: isPositive 
        ? "We're glad you found the transformation helpful." 
        : "We'll work on improving our transformations.",
      duration: 3000,
    });
  };

  return (
    <div className="flex items-center space-x-4 animate-slide-up">
      <span className="text-sm text-muted-foreground">Was this human enough?</span>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFeedback(true)} 
          disabled={disabled}
          className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          Yes
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFeedback(false)} 
          disabled={disabled}
          className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          No
        </Button>
      </div>
    </div>
  );
};

export default FeedbackButtons;
