import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sendChatMessage, getChatHistory } from "@/lib/chat-api";
import { type ChatMessage } from "@shared/schema";

export function useChat(sessionId: string) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get chat history
  const { data: chatData } = useQuery({
    queryKey: ["/api/chat", sessionId],
    queryFn: () => getChatHistory(sessionId),
    enabled: !!sessionId,
  });

  const messages: ChatMessage[] = chatData?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      // Invalidate and refetch chat history
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to send message. Please try again.");
    },
  });

  const sendMessage = useCallback(
    (question: string) => {
      sendMessageMutation.mutate({
        question,
        sessionId,
      });
    },
    [sendMessageMutation, sessionId]
  );

  return {
    messages,
    isLoading: sendMessageMutation.isPending,
    sendMessage,
    error,
  };
}
