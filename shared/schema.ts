import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  sources: jsonb("sources"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentChunks = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  illness: text("illness").notNull(),
  caseDescription: text("case_description").notNull(),
  correctDiagnosis: text("correct_diagnosis").notNull(),
  correctTreatment: text("correct_treatment").notNull(),
  userDiagnosis: text("user_diagnosis"),
  userTreatment: text("user_treatment"),
  diagnosisScore: integer("diagnosis_score"),
  treatmentScore: integer("treatment_score"),
  feedback: text("feedback"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat API request/response schemas
export const chatRequestSchema = z.object({
  question: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
});

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  page: z.string().optional(),
  section: z.string().optional(),
});

export const chatResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(sourceSchema),
  sessionId: z.string(),
});

// Case Study API schemas
export const generateCaseStudyRequestSchema = z.object({
  sessionId: z.string().optional(),
});

export const submitAnswersRequestSchema = z.object({
  caseStudyId: z.number(),
  diagnosis: z.string().min(1).max(500),
  treatment: z.string().min(1).max(1000),
});

export const caseStudyResponseSchema = z.object({
  id: z.number(),
  sessionId: z.string(),
  illness: z.string(),
  caseDescription: z.string(),
  isCompleted: z.boolean(),
});

export const caseStudyResultSchema = z.object({
  diagnosisScore: z.number(),
  treatmentScore: z.number(),
  feedback: z.string(),
  correctDiagnosis: z.string(),
  correctTreatment: z.string(),
  isCompleted: z.boolean(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentChunkSchema = createInsertSchema(documentChunks).omit({
  id: true,
  createdAt: true,
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type GenerateCaseStudyRequest = z.infer<typeof generateCaseStudyRequestSchema>;
export type SubmitAnswersRequest = z.infer<typeof submitAnswersRequestSchema>;
export type CaseStudyResponse = z.infer<typeof caseStudyResponseSchema>;
export type CaseStudyResult = z.infer<typeof caseStudyResultSchema>;
