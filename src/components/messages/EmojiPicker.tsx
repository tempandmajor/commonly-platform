
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EmojiPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  open,
  onOpenChange,
  onEmojiSelect
}) => {
  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😍', '🙏', 
                  '😎', '🤔', '😢', '😡', '🤮', '👋', '🤝', '👀'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an emoji</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-8 gap-2 p-4">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onEmojiSelect(emoji)}
              className="text-2xl p-2 hover:bg-gray-100 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmojiPicker;
