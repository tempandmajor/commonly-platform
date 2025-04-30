
import { useState } from "react";

export const useEmojiPicker = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  // Add an emoji to the message
  const handleEmojiSelect = (emoji: string) => {
    setShowEmojiPicker(false);
    return emoji;
  };

  return {
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiSelect
  };
};
