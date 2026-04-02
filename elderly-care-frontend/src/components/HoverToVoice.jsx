import { useEffect, useRef, useState } from 'react';

export default function HoverToVoice() {
  const lastWordRef = useRef('');
  const [isEnabled, setIsEnabled] = useState(localStorage.getItem('hoverToSpeak') !== 'false');

  useEffect(() => {
    const handleToggle = () => setIsEnabled(localStorage.getItem('hoverToSpeak') !== 'false');
    window.addEventListener('storage', handleToggle);
    window.addEventListener('hoverToSpeakToggle', handleToggle);
    return () => {
      window.removeEventListener('storage', handleToggle);
      window.removeEventListener('hoverToSpeakToggle', handleToggle);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      window.speechSynthesis.cancel();
      return;
    }

    let timeout;
    
    function getWordAtPoint(x, y) {
      let textNode;
      let offset;

      if (document.caretPositionFromPoint) {
        let position = document.caretPositionFromPoint(x, y);
        if (!position) return null;
        textNode = position.offsetNode;
        offset = position.offset;
      } else if (document.caretRangeFromPoint) {
        let range = document.caretRangeFromPoint(x, y);
        if (!range) return null;
        textNode = range.startContainer;
        offset = range.startOffset;
      }

      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || '';
        
        // Define what constitutes a "word character" (not whitespace, not common punctuation)
        const isWordChar = (char) => /[^\s.,!?;:"()[\]{}]/.test(char);

        let start = offset;
        while (start > 0 && isWordChar(text[start - 1])) {
          start--;
        }
        let end = offset;
        while (end < text.length && isWordChar(text[end])) {
          end++;
        }
        
        const word = text.substring(start, end).trim();
        return word.length > 0 ? word : null;
      }
      return null;
    }

    const handleMouseMove = (e) => {
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        const word = getWordAtPoint(e.clientX, e.clientY);
        if (word && word !== lastWordRef.current) {
           lastWordRef.current = word;
           window.speechSynthesis.cancel(); // Stop current speech
           const utterance = new SpeechSynthesisUtterance(word);
           window.speechSynthesis.speak(utterance);
        } else if (!word) {
           lastWordRef.current = '';
        }
      }, 400); // Speak after 400ms hover
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isEnabled]);

  return null;
}
