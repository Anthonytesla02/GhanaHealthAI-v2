import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getChatHistory } from "@/lib/chat-api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatSession {
  sessionId: string;
  lastMessage: string;
  messageCount: number;
  lastActivity: Date;
  category: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock sessions for demo - in real app this would come from API
  useEffect(() => {
    const mockSessions: ChatSession[] = [
      {
        sessionId: "session_1749275184283_dspep859b",
        lastMessage: "What is the treatment for malaria?",
        messageCount: 4,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: "Infectious Diseases"
      },
      {
        sessionId: "session_1749275207392_zc71ohpsy",
        lastMessage: "Symptoms of diabetes mellitus",
        messageCount: 6,
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: "Endocrine"
      },
      {
        sessionId: "session_1749275370961_5wgicexv1",
        lastMessage: "Treatment for hypertension in pregnancy",
        messageCount: 8,
        lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        category: "Cardiovascular"
      }
    ];
    setSessions(mockSessions);
  }, []);

  const categories = ["all", "Infectious Diseases", "Endocrine", "Cardiovascular", "Pediatrics"];

  const filteredSessions = sessions.filter(session => 
    selectedCategory === "all" || session.category === selectedCategory
  );

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Infectious Diseases": "bg-red-100 text-red-700",
      "Endocrine": "bg-blue-100 text-blue-700",
      "Cardiovascular": "bg-purple-100 text-purple-700",
      "Pediatrics": "bg-green-100 text-green-700",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Chat History</h1>
            <p className="text-sm text-gray-600">{sessions.length} conversations</p>
          </div>
          <Button variant="outline" size="sm">
            <i className="fas fa-search mr-2"></i>
            Search
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {category === "all" ? "All" : category}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.sessionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(session.category)}>
                        {session.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {session.messageCount} messages
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1 line-clamp-2">
                      {session.lastMessage}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(session.lastActivity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-eye text-gray-400"></i>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-share text-gray-400"></i>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <i className="fas fa-history text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No conversations yet</h3>
            <p className="text-sm text-gray-500">
              Start a conversation to see your chat history here
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}