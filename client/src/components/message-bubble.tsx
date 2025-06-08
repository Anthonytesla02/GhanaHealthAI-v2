import { type ChatMessage } from "@shared/schema";
import { SourceCitations } from "./source-citations";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-xs shadow-sm">
          <p className="text-sm">{message.content}</p>
          <div className="flex justify-end mt-2">
            <span className="text-xs text-blue-100">{timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-sm shadow-sm">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-2">
            <i className="fas fa-robot text-white text-xs"></i>
          </div>
          <span className="text-xs font-medium text-slate-600">Medical Assistant</span>
        </div>

        <div className="prose-sm text-slate-700 mb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Source Citations */}
        {message.sources && Array.isArray(message.sources) && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}

        <div className="flex justify-start mt-3">
          <span className="text-xs text-slate-500">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
