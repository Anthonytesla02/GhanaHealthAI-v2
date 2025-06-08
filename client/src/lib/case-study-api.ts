import type { CaseStudyResponse, CaseStudyResult, GenerateCaseStudyRequest, SubmitAnswersRequest } from "@shared/schema";

export async function generateCaseStudy(data: GenerateCaseStudyRequest): Promise<CaseStudyResponse> {
  const response = await fetch('/api/case-study/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to generate case study');
  }

  return response.json();
}

export async function submitCaseStudyAnswers(data: SubmitAnswersRequest): Promise<CaseStudyResult> {
  const response = await fetch('/api/case-study/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit answers');
  }

  return response.json();
}

export async function getCaseStudies(sessionId: string) {
  const response = await fetch(`/api/case-study/${sessionId}`);

  if (!response.ok) {
    throw new Error('Failed to get case studies');
  }

  return response.json();
}