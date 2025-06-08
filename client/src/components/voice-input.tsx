import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  onVoiceText: (text: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
}

export function VoiceInput({ onVoiceText, isListening, onListeningChange }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          // Clear timeout if we have final results
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Set a timeout to finalize the transcript
          timeoutRef.current = setTimeout(() => {
            onVoiceText(finalTranscript.trim());
            stopListening();
          }, 1000);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart if we're still supposed to be listening
          try {
            recognition.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
            stopListening();
          }
        }
      };
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, onVoiceText]);

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      try {
        setTranscript("");
        recognitionRef.current.start();
        onListeningChange(true);
        
        // Haptic feedback simulation
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        onListeningChange(false);
        
        // Haptic feedback simulation
        if (navigator.vibrate) {
          navigator.vibrate([30, 30, 30]);
        }
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button
          onClick={toggleListening}
          className={`relative w-12 h-12 rounded-full transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 shadow-lg"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          size="sm"
        >
          <motion.i
            className={`fas ${isListening ? "fa-stop" : "fa-microphone"} text-white`}
            animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
          />
          
          {/* Pulse animation for listening state */}
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </Button>
      </motion.div>

      {/* Transcript display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-14 right-0 bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-48"
          >
            <div className="text-xs text-gray-600 mb-1">Listening...</div>
            <div className="text-sm text-gray-900 font-medium">{transcript}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}