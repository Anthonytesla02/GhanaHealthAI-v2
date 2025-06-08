import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { generateCaseStudy, submitCaseStudyAnswers } from "@/lib/case-study-api";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { CaseStudyResponse, CaseStudyResult } from "@shared/schema";

interface CaseStudyState {
  currentCaseStudy: CaseStudyResponse | null;
  diagnosis: string;
  treatment: string;
  results: CaseStudyResult | null;
  showResults: boolean;
}

// Helper function to parse and display case description in structured format
const parseCaseDescription = (description: string) => {
  const sections = description.split(/(?=PATIENT INFO:|PRESENTING COMPLAINTS:|MEDICAL HISTORY:)/);
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        if (!section.trim()) return null;
        
        const lines = section.trim().split('\n');
        const header = lines[0];
        const content = lines.slice(1).join(' ').trim();
        
        if (header.includes('PATIENT INFO:')) {
          return (
            <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <i className="fas fa-user text-blue-600"></i>
                Patient Information
              </h4>
              <p className="text-gray-700">{content || header.replace('PATIENT INFO:', '').trim()}</p>
            </div>
          );
        }
        
        if (header.includes('PRESENTING COMPLAINTS:')) {
          return (
            <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-orange-600"></i>
                Presenting Complaints
              </h4>
              <p className="text-gray-700">{content || header.replace('PRESENTING COMPLAINTS:', '').trim()}</p>
            </div>
          );
        }
        
        if (header.includes('MEDICAL HISTORY:')) {
          return (
            <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <i className="fas fa-history text-green-600"></i>
                Medical History
              </h4>
              <p className="text-gray-700">{content || header.replace('MEDICAL HISTORY:', '').trim()}</p>
            </div>
          );
        }
        
        // Fallback for unstructured content
        return (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap">{section.trim()}</p>
          </div>
        );
      })}
    </div>
  );
};

export default function CaseStudyPage() {
  const [state, setState] = useState<CaseStudyState>({
    currentCaseStudy: null,
    diagnosis: "",
    treatment: "",
    results: null,
    showResults: false,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Generate new case study mutation
  const generateCaseStudyMutation = useMutation({
    mutationFn: async () => {
      const sessionId = `case_study_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return generateCaseStudy({ sessionId });
    },
    onSuccess: (data: CaseStudyResponse) => {
      setState(prev => ({
        ...prev,
        currentCaseStudy: data,
        diagnosis: "",
        treatment: "",
        results: null,
        showResults: false,
      }));
      toast({
        title: "New Case Study Generated",
        description: "Read the case and provide your diagnosis and treatment plan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate case study. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit answers mutation
  const submitAnswersMutation = useMutation({
    mutationFn: async () => {
      if (!state.currentCaseStudy) throw new Error("No case study available");
      
      return submitCaseStudyAnswers({
        caseStudyId: state.currentCaseStudy.id,
        diagnosis: state.diagnosis,
        treatment: state.treatment,
      });
    },
    onSuccess: (data: CaseStudyResult) => {
      setState(prev => ({
        ...prev,
        results: data,
        showResults: true,
      }));
      toast({
        title: "Answers Submitted",
        description: "Your case study has been evaluated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateNew = () => {
    generateCaseStudyMutation.mutate();
  };

  const handleSubmitAnswers = () => {
    if (!state.diagnosis.trim() || !state.treatment.trim()) {
      toast({
        title: "Incomplete Answers",
        description: "Please provide both diagnosis and treatment.",
        variant: "destructive",
      });
      return;
    }
    submitAnswersMutation.mutate();
  };

  const handleStartOver = () => {
    setState({
      currentCaseStudy: null,
      diagnosis: "",
      treatment: "",
      results: null,
      showResults: false,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="flex-1 p-4 pb-20 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Medical Case Study Generator
        </h1>
        <p className="text-gray-600">
          Practice your diagnostic and treatment skills with AI-generated case studies based on Ghana Standard Treatment Guidelines.
        </p>
      </div>

      {/* Generate Case Study Section */}
      {!state.currentCaseStudy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-stethoscope text-2xl text-blue-600"></i>
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready to Practice?</h2>
            <p className="text-gray-600 mb-6">
              Generate a realistic medical case study designed for pharmacist training. Test your diagnostic skills using patient symptoms and medical history.
            </p>
          </div>
          
          <Button
            onClick={handleGenerateNew}
            disabled={generateCaseStudyMutation.isPending}
            size="lg"
            className="px-8"
          >
            {generateCaseStudyMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Generating Case Study...
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-2"></i>
                Generate New Case Study
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Case Study Display */}
      {state.currentCaseStudy && !state.showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Patient Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-user-injured text-blue-600"></i>
                Patient Case
              </CardTitle>
              <CardDescription>
                Review the patient information and symptoms carefully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parseCaseDescription(state.currentCaseStudy.caseDescription)}
            </CardContent>
          </Card>

          {/* Answer Form */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. What is your diagnosis?</CardTitle>
                <CardDescription>
                  Provide the most likely diagnosis based on the case presentation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your diagnosis here..."
                  value={state.diagnosis}
                  onChange={(e) => setState(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. What is your treatment plan?</CardTitle>
                <CardDescription>
                  Describe the appropriate treatment according to Ghana STG.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your treatment plan here..."
                  value={state.treatment}
                  onChange={(e) => setState(prev => ({ ...prev, treatment: e.target.value }))}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleStartOver}
              disabled={submitAnswersMutation.isPending}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Start Over
            </Button>
            <Button
              onClick={handleSubmitAnswers}
              disabled={submitAnswersMutation.isPending || !state.diagnosis.trim() || !state.treatment.trim()}
              size="lg"
            >
              {submitAnswersMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Evaluating...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Submit Answers
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Results Display */}
      {state.showResults && state.results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-bar mr-2 text-blue-600"></i>
                Your Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Diagnosis Score</span>
                    <Badge variant={getScoreBadgeVariant(state.results.diagnosisScore)}>
                      {state.results.diagnosisScore}/100
                    </Badge>
                  </div>
                  <Progress value={state.results.diagnosisScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Treatment Score</span>
                    <Badge variant={getScoreBadgeVariant(state.results.treatmentScore)}>
                      {state.results.treatmentScore}/100
                    </Badge>
                  </div>
                  <Progress value={state.results.treatmentScore} className="h-2" />
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getScoreColor((state.results.diagnosisScore + state.results.treatmentScore) / 2)}`}>
                  {Math.round((state.results.diagnosisScore + state.results.treatmentScore) / 2)}%
                </div>
                <p className="text-gray-600">Overall Score</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {state.results.feedback}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Correct Answers */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">
                  <i className="fas fa-check-circle mr-2"></i>
                  Correct Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{state.results.correctDiagnosis}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">
                  <i className="fas fa-pills mr-2"></i>
                  Correct Treatment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{state.results.correctTreatment}</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleStartOver}>
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Start
            </Button>
            <Button onClick={handleGenerateNew}>
              <i className="fas fa-refresh mr-2"></i>
              Generate Another Case
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}