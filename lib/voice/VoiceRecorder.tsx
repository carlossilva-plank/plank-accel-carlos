'use client';

import { useState, useEffect } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        onRecordingComplete(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        }
      };

      try {
        recognition.start();
        setRecognition(recognition);
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsRecording(false);
      }
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const stopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className="rounded-full p-2 text-[#4CAF50] hover:bg-[#4CAF50]/10 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isRecording ? (
        <StopIcon className="h-5 w-5 animate-pulse" />
      ) : (
        <MicrophoneIcon className="h-5 w-5" />
      )}
    </button>
  );
}
