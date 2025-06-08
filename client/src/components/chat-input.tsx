import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "./voice-input";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "What are the treatment options for malaria?",
  "How to manage diabetes?",
  "What are the symptoms of pneumonia?",
  "Recommended treatment for hypertension?",
];

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    onSendMessage(trimmedMessage);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  const handleVoiceText = (text: string) => {
    setMessage(text);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <motion.footer 
      className="bg-white border-t border-slate-200 p-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <motion.div
              animate={{ scale: isListening ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about medical conditions, treatments, or guidelines..."
                className={`w-full px-4 py-3 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm min-h-[44px] max-h-[120px] ${
                  isListening ? "border-red-300 bg-red-50" : "border-slate-300"
                }`}
                disabled={isLoading || isListening}
              />
            </motion.div>
            <div className="absolute bottom-2 right-2 text-xs text-slate-400">
              {message.length}/500
            </div>
          </div>

          {/* Quick Suggestions */}
          <AnimatePresence>
            {!isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mt-2 overflow-hidden"
              >
                {SUGGESTIONS.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    type="button"
                    onClick={() => insertSuggestion(suggestion)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {suggestion.replace("?", "").substring(0, 20)}...
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-end space-x-2">
          <VoiceInput
            onVoiceText={handleVoiceText}
            isListening={isListening}
            onListeningChange={setIsListening}
          />
          
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              type="submit"
              disabled={!message.trim() || isLoading || isListening}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-xl transition-colors duration-200 flex-shrink-0"
            >
              {isLoading ? (
                <motion.i
                  className="fas fa-spinner text-sm"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <i className="fas fa-paper-plane text-sm"></i>
              )}
            </Button>
          </motion.div>
        </div>
      </form>

      {/* Connection Status */}
      <motion.div
        className="flex items-center justify-center mt-3 space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-1">
          <motion.div
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-slate-500">Connected to STG Database</span>
        </div>
        <span className="text-xs text-slate-400">•</span>
        <span className="text-xs text-slate-500">~1.2s response</span>
      </motion.div>
    </motion.footer>
  );
}
