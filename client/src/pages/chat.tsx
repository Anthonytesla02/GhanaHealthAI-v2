import { useState } from "react";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { useChat } from "@/hooks/use-chat";

export default function ChatPage() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { messages, isLoading, sendMessage, error } = useChat(sessionId);

  return (
    <div className="flex-1 flex flex-col bg-white pb-20">
      <ChatHeader />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      {error && (
        <div className="fixed top-20 left-4 right-4 max-w-md mx-auto z-50">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <div>
                <p className="font-medium text-sm">Connection Error</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
