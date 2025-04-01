import { ToneType } from '@/components/ToneSelector';

// Since we don't have a real AI model for text transformation in the browser,
// we'll create a simple mock implementation for demonstration purposes
export const transformText = async (
  text: string, 
  tone: ToneType, 
  matchOriginalTone: boolean
): Promise<string> => {
  // In a real implementation, this would call an API or use a more sophisticated algorithm
  if (!text.trim()) return '';
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple transformations based on selected tone
  // This is a very basic implementation for demo purposes
  let transformed = text;
  
  const casualisms = [
    [/cannot/g, "can't"],
    [/will not/g, "won't"],
    [/do not/g, "don't"],
    [/I am/g, "I'm"],
    [/You are/g, "You're"],
    [/They are/g, "They're"],
    [/We are/g, "We're"],
    [/\w+ is/g, (match) => match.replace(' is', "'s")],
    [/therefore/g, "so"],
    [/furthermore/g, "also"],
    [/utilize/g, "use"],
    [/numerous/g, "many"],
    [/\./g, ". "],
    [/\bit is\b/g, "it's"],
    [/\bcannot\b/g, "can't"]
  ];
  
  const professionalisms = [
    [/\bget\b/g, "obtain"],
    [/\bgot\b/g, "received"],
    [/\bkinda\b/g, "somewhat"],
    [/\bshow\b/g, "demonstrate"],
    [/\buse\b/g, "utilize"],
    [/\bamazing\b/g, "exceptional"],
    [/\bhuge\b/g, "significant"],
    [/\bbig\b/g, "substantial"]
  ];
  
  const empatheticisms = [
    [/\bI think\b/g, "I feel"],
    [/\bI believe\b/g, "I understand"],
    [/\bYou should\b/g, "You might want to consider"],
    [/\bYou need to\b/g, "It might help if you"],
    [/\bYou must\b/g, "It would be beneficial to"],
    [/\bproblem\b/g, "challenge"],
    [/\bfailure\b/g, "learning opportunity"],
    [/\bissue\b/g, "situation"]
  ];
  
  const witticisms = [
    [/\bdifficult\b/g, "trickier than explaining TikTok to grandparents"],
    [/\beasy\b/g, "a piece of cake (and who doesn't love cake?)"],
    [/\bimportant\b/g, "more critical than coffee on a Monday morning"],
    [/\bgood\b/g, "better than finding extra fries at the bottom of the bag"],
    [/\bbad\b/g, "worse than a paper cut between your fingers"],
    [/\binteresting\b/g, "more fascinating than watching paint dry (which isn't saying much)"]
  ];
  
  const friendlyisms = [
    [/\bHello\b/g, "Hey there"],
    [/\bGreetings\b/g, "Hi friend"],
    [/\bGood day\b/g, "Hey"],
    [/\bHowever\b/g, "But"],
    [/\bIn addition\b/g, "Also"],
    [/\bIn conclusion\b/g, "To wrap up"],
    [/\bTherefore\b/g, "So"],
    [/\bConsequently\b/g, "That's why"],
    [/\bIn spite of the fact that\b/g, "Although"],
    [/\bIn the event that\b/g, "If"]
  ];
  
  let substitutions;
  
  switch (tone) {
    case 'casual':
      substitutions = casualisms;
      // Add some casual expressions
      if (!matchOriginalTone) {
        transformed = transformed.replace(/\.\s+/g, ". ");
        transformed = transformed.replace(/([.?!])\s*(\w)/g, (_, p1, p2) => 
          Math.random() > 0.7 ? `${p1} So ${p2.toLowerCase()}` : `${p1} ${p2}`
        );
      }
      break;
    case 'professional':
      substitutions = professionalisms;
      // Make it more formal
      if (!matchOriginalTone) {
        transformed = transformed.replace(/!+/g, ".");
        transformed = transformed.replace(/\b(\w+)'s\b/g, "the $1 is");
      }
      break;
    case 'empathetic':
      substitutions = empatheticisms;
      // Add empathetic phrases
      if (!matchOriginalTone) {
        transformed = transformed.replace(/([.?!])\s*(\w)/g, (_, p1, p2) => 
          Math.random() > 0.7 ? `${p1} I understand ${p2.toLowerCase()}` : `${p1} ${p2}`
        );
      }
      break;
    case 'witty':
      substitutions = witticisms;
      // Add some humorous remarks
      if (!matchOriginalTone) {
        transformed = transformed + (Math.random() > 0.5 ? "\n\n(But hey, what do I know? I'm just a text transformer!)" : "");
      }
      break;
    case 'friendly':
      substitutions = friendlyisms;
      // Add friendly touches
      if (!matchOriginalTone) {
        transformed = transformed.replace(/([.?!])\s*(\w)/g, (_, p1, p2) => 
          Math.random() > 0.7 ? `${p1} Hey, ${p2.toLowerCase()}` : `${p1} ${p2}`
        );
      }
      break;
    default:
      substitutions = casualisms;
  }
  
  // Apply the substitutions but only somewhat if matchOriginalTone is true
  substitutions.forEach(([pattern, replacement]) => {
    if (matchOriginalTone) {
      // Apply substitutions more selectively when matching original tone
      const matches = transformed.match(pattern);
      if (matches && matches.length > 0) {
        // Only replace a few instances to keep it subtle
        const maxToReplace = Math.max(1, Math.floor(matches.length * 0.3));
        for (let i = 0; i < maxToReplace; i++) {
          transformed = transformed.replace(pattern, replacement as string);
        }
      }
    } else {
      // Apply all substitutions when not matching original tone
      transformed = transformed.replace(pattern, replacement as string);
    }
  });
  
  // Clean up any double spaces
  transformed = transformed.replace(/\s{2,}/g, " ");
  
  return transformed;
};
