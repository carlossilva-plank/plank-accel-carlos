'use client';

import { useState } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface TextToSpeechProps {
  text: string;
}

export default function TextToSpeech({ text }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  return (
    <button
      onClick={speak}
      className="rounded-full p-1 text-[#4CAF50] hover:bg-[#4CAF50]/10 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
      title="Listen to response"
    >
      <SpeakerWaveIcon className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
    </button>
  );
}
