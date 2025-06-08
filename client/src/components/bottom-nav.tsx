import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  {
    id: "chat",
    label: "Chat",
    icon: "fas fa-comments",
    path: "/",
  },
  {
    id: "case-study",
    label: "Case Study",
    icon: "fas fa-stethoscope",
    path: "/case-study",
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: "fas fa-ambulance",
    path: "/emergency",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "fas fa-user-md",
    path: "/profile",
  },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [location, setLocation] = useLocation();

  const handleTabPress = (tab: typeof tabs[0]) => {
    onTabChange(tab.id);
    setLocation(tab.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabPress(tab)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className={`relative flex items-center justify-center w-8 h-8 mb-1 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <i className={`${tab.icon} text-lg`}></i>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                )}
              </motion.div>
              <motion.span
                className={`text-xs font-medium ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
                animate={{
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tab.label}
              </motion.span>
              {isActive && (
                <motion.div
                  className="absolute -top-2 left-1/2 w-6 h-1 bg-blue-600 rounded-full"
                  initial={{ scaleX: 0, x: "-50%" }}
                  animate={{ scaleX: 1, x: "-50%" }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}