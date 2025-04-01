
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookmarkIcon, Copy, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SavedTransforms = () => {
  const { toast } = useToast();
  const [savedTexts, setSavedTexts] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadSavedTexts = () => {
      const saved = localStorage.getItem('savedTransformedTexts');
      setSavedTexts(saved ? JSON.parse(saved) : []);
    };
    
    loadSavedTexts();
    // Reload when dialog opens
    if (open) {
      loadSavedTexts();
    }
  }, [open]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
      duration: 2000,
    });
  };

  const deleteText = (index: number) => {
    const newSavedTexts = [...savedTexts];
    newSavedTexts.splice(index, 1);
    setSavedTexts(newSavedTexts);
    localStorage.setItem('savedTransformedTexts', JSON.stringify(newSavedTexts));
    
    toast({
      title: "Deleted",
      description: "Text removed from saved collection.",
      duration: 2000,
    });
  };

  const clearAllSaved = () => {
    setSavedTexts([]);
    localStorage.removeItem('savedTransformedTexts');
    
    toast({
      title: "All Cleared",
      description: "All saved texts have been removed.",
      duration: 2000,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-4">
          <BookmarkIcon className="h-4 w-4 mr-2" />
          Saved Texts
          {savedTexts.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-purple text-white text-xs rounded-full">
              {savedTexts.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Saved Humanized Texts</span>
            {savedTexts.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearAllSaved}>
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {savedTexts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No saved texts yet. When you save a transformed text, it will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {savedTexts.map((text, index) => (
                <div key={index} className="border rounded-md p-3 relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(text)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteText(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm max-h-[120px] overflow-hidden relative">
                    {text.slice(0, 300)}
                    {text.length > 300 && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {text.length} characters • {text.trim().split(/\s+/).length} words
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SavedTransforms;
