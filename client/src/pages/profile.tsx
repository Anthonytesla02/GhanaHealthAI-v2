import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface UserStats {
  totalQuestions: number;
  questionsThisWeek: number;
  favoriteCategory: string;
  responseTime: string;
}

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const userStats: UserStats = {
    totalQuestions: 127,
    questionsThisWeek: 23,
    favoriteCategory: "Infectious Diseases",
    responseTime: "1.2s avg"
  };

  const categories = [
    { name: "Infectious Diseases", count: 45, color: "bg-red-100 text-red-700" },
    { name: "Cardiovascular", count: 32, color: "bg-blue-100 text-blue-700" },
    { name: "Endocrine", count: 28, color: "bg-green-100 text-green-700" },
    { name: "Pediatrics", count: 22, color: "bg-purple-100 text-purple-700" },
  ];

  const achievements = [
    { icon: "fas fa-medal", title: "Medical Explorer", description: "Asked 100+ questions", unlocked: true },
    { icon: "fas fa-star", title: "Quick Learner", description: "Used app 7 days in a row", unlocked: true },
    { icon: "fas fa-heart", title: "Health Advocate", description: "Shared 10 health tips", unlocked: false },
    { icon: "fas fa-trophy", title: "Expert User", description: "Reached 500 questions", unlocked: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fas fa-user-md text-3xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Medical Assistant User</h1>
            <p className="text-blue-100">Ghana STG Guidelines</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center">
                <i className="fas fa-check-circle mr-1"></i>
                <span className="text-sm">Verified</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                <span className="text-sm">Active user</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-white shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-white shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.questionsThisWeek}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-white shadow-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-purple-600">{userStats.favoriteCategory}</div>
                <div className="text-xs text-gray-600">Top Category</div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-white shadow-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{userStats.responseTime}</div>
                <div className="text-xs text-gray-600">Response Time</div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Question Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Question Categories</h3>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={category.color}>{category.name}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{category.count}</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${(category.count / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.title}
                  className={`p-3 rounded-lg border-2 ${
                    achievement.unlocked
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <i className={`${achievement.icon} text-2xl mb-2 ${
                      achievement.unlocked ? "text-green-600" : "text-gray-400"
                    }`}></i>
                    <h4 className={`font-medium text-sm ${
                      achievement.unlocked ? "text-green-900" : "text-gray-600"
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      achievement.unlocked ? "text-green-700" : "text-gray-500"
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">Get notified about health updates</p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Offline Mode</h4>
                  <p className="text-sm text-gray-600">Access saved content offline</p>
                </div>
                <Switch
                  checked={offlineMode}
                  onCheckedChange={setOfflineMode}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Button variant="outline" className="w-full">
            <i className="fas fa-download mr-2"></i>
            Export Chat History
          </Button>
          <Button variant="outline" className="w-full">
            <i className="fas fa-share mr-2"></i>
            Share App
          </Button>
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
            <i className="fas fa-sign-out-alt mr-2"></i>
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}