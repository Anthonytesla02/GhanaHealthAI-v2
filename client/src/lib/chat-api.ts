import { apiRequest } from "./queryClient";
import { type ChatRequest, type ChatResponse } from "@shared/schema";

export async function sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
  const response = await apiRequest("POST", "/api/search", data);
  return response.json();
}

export async function getChatHistory(sessionId: string) {
  const response = await apiRequest("GET", `/api/chat/${sessionId}`);
  return response.json();
}

export async function checkHealth() {
  const response = await apiRequest("GET", "/api/health");
  return response.json();
}
