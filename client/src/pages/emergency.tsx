import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmergencyContact {
  name: string;
  number: string;
  type: "ambulance" | "hospital" | "poison" | "police";
  description: string;
}

interface EmergencyGuide {
  condition: string;
  icon: string;
  priority: "critical" | "urgent" | "moderate";
  steps: string[];
  warning?: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    name: "National Ambulance Service",
    number: "193",
    type: "ambulance",
    description: "24/7 Emergency Medical Response"
  },
  {
    name: "Ghana Police Service",
    number: "191",
    type: "police",
    description: "Emergency Police Response"
  },
  {
    name: "National Fire Service",
    number: "192",
    type: "hospital",
    description: "Fire & Rescue Emergency"
  },
  {
    name: "Poison Control Center",
    number: "+233-302-665-401",
    type: "poison",
    description: "Toxicology Emergency Hotline"
  }
];

const emergencyGuides: EmergencyGuide[] = [
  {
    condition: "Severe Allergic Reaction",
    icon: "fas fa-exclamation-triangle",
    priority: "critical",
    steps: [
      "Call 193 immediately",
      "Remove or avoid the allergen if known",
      "Help person lie flat with legs elevated",
      "Administer epinephrine if available",
      "Monitor breathing and pulse",
      "Be prepared to perform CPR"
    ],
    warning: "Anaphylaxis can be fatal within minutes"
  },
  {
    condition: "Heart Attack",
    icon: "fas fa-heartbeat",
    priority: "critical",
    steps: [
      "Call 193 immediately",
      "Give aspirin if not allergic (300mg chewed)",
      "Help person sit comfortably",
      "Loosen tight clothing",
      "Monitor vital signs",
      "Be ready to perform CPR"
    ]
  },
  {
    condition: "Severe Bleeding",
    icon: "fas fa-tint",
    priority: "critical",
    steps: [
      "Call 193 if bleeding is severe",
      "Apply direct pressure with clean cloth",
      "Elevate the injured area above heart level",
      "Do not remove embedded objects",
      "Apply pressure to pressure points if needed",
      "Monitor for shock symptoms"
    ]
  },
  {
    condition: "Choking",
    icon: "fas fa-lungs",
    priority: "critical",
    steps: [
      "Encourage coughing if person can speak",
      "Give 5 back blows between shoulder blades",
      "Give 5 abdominal thrusts (Heimlich maneuver)",
      "Alternate back blows and abdominal thrusts",
      "Call 193 if obstruction persists",
      "Continue until object is expelled or person becomes unconscious"
    ]
  }
];

export default function EmergencyPage() {
  const [selectedTab, setSelectedTab] = useState<"contacts" | "guides">("contacts");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-700 border-red-200";
      case "urgent": return "bg-orange-100 text-orange-700 border-orange-200";
      case "moderate": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-red-50 pb-20">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white px-4 py-6">
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <i className="fas fa-ambulance text-2xl"></i>
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Emergency Services</h1>
        <p className="text-red-100 text-center text-sm">
          Ghana Medical Emergency Response
        </p>
        
        {/* Quick Call Button */}
        <motion.div
          className="mt-6"
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => handleCall("193")}
            className="w-full bg-white text-red-600 hover:bg-red-50 text-lg font-bold py-4"
            size="lg"
          >
            <i className="fas fa-phone mr-3 text-xl"></i>
            CALL 193 - EMERGENCY
          </Button>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex rounded-lg bg-gray-100 p-1">
          {["contacts", "guides"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as typeof selectedTab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                selectedTab === tab
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "contacts" ? "Emergency Contacts" : "First Aid Guides"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {selectedTab === "contacts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Alert className="border-red-200 bg-red-50">
              <i className="fas fa-info-circle text-red-600"></i>
              <AlertDescription className="text-red-700">
                In life-threatening emergencies, call 193 immediately. These services are available 24/7.
              </AlertDescription>
            </Alert>

            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <i className={`fas ${
                          contact.type === "ambulance" ? "fa-ambulance" :
                          contact.type === "hospital" ? "fa-hospital" :
                          contact.type === "poison" ? "fa-flask" :
                          "fa-shield-alt"
                        } text-red-600`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.description}</p>
                        <p className="text-lg font-bold text-red-600 mt-1">{contact.number}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCall(contact.number)}
                      className="bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <i className="fas fa-phone mr-2"></i>
                      Call
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedTab === "guides" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Alert className="border-yellow-200 bg-yellow-50">
              <i className="fas fa-exclamation-triangle text-yellow-600"></i>
              <AlertDescription className="text-yellow-700">
                These guides are for reference only. Always call emergency services for serious medical emergencies.
              </AlertDescription>
            </Alert>

            {emergencyGuides.map((guide, index) => (
              <motion.div
                key={guide.condition}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <i className={`${guide.icon} text-red-600`}></i>
                      </div>
                      <h3 className="font-semibold text-gray-900">{guide.condition}</h3>
                    </div>
                    <Badge className={getPriorityColor(guide.priority)}>
                      {guide.priority.toUpperCase()}
                    </Badge>
                  </div>

                  {guide.warning && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700 font-medium">
                        ⚠️ {guide.warning}
                      </AlertDescription>
                    </Alert>
                  )}

                  <ol className="space-y-2">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}