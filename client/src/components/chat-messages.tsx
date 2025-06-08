import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { type ChatMessage } from "@shared/schema";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-xs text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-user-md text-white text-lg"></i>
            </div>
            <h3 className="font-semibold text-slate-700 mb-2">Ghana Medical Assistant</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ask me questions about Ghana's Standard Treatment Guidelines. I'll provide evidence-based answers with source references.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {isLoading && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </main>
  );
}
