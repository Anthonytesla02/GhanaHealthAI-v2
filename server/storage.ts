import { chatMessages, documentChunks, caseStudies, type ChatMessage, type DocumentChunk, type CaseStudy, type InsertCaseStudy, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  addChatMessage(message: any): Promise<ChatMessage>;
  getDocumentChunks(): Promise<DocumentChunk[]>;
  addDocumentChunk(chunk: any): Promise<DocumentChunk>;
  getCaseStudies(sessionId: string): Promise<CaseStudy[]>;
  addCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: number, updates: Partial<CaseStudy>): Promise<CaseStudy>;
  getCaseStudyById(id: number): Promise<CaseStudy | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatMessages: Map<string, ChatMessage[]>;
  private documentChunks: DocumentChunk[];
  private caseStudies: Map<string, CaseStudy[]>;
  private caseStudyById: Map<number, CaseStudy>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentChunkId: number;
  private currentCaseStudyId: number;

  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.documentChunks = [];
    this.caseStudies = new Map();
    this.caseStudyById = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentChunkId = 1;
    this.currentCaseStudyId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(sessionId) || [];
  }

  async addChatMessage(message: any): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const chatMessage: ChatMessage = {
      id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      sources: message.sources,
      createdAt: new Date(),
    };

    if (!this.chatMessages.has(message.sessionId)) {
      this.chatMessages.set(message.sessionId, []);
    }
    this.chatMessages.get(message.sessionId)!.push(chatMessage);
    
    return chatMessage;
  }

  async getDocumentChunks(): Promise<DocumentChunk[]> {
    return this.documentChunks;
  }

  async addDocumentChunk(chunk: any): Promise<DocumentChunk> {
    const id = this.currentChunkId++;
    const documentChunk: DocumentChunk = {
      id,
      content: chunk.content,
      metadata: chunk.metadata,
      createdAt: new Date(),
    };
    
    this.documentChunks.push(documentChunk);
    return documentChunk;
  }

  async getCaseStudies(sessionId: string): Promise<CaseStudy[]> {
    return this.caseStudies.get(sessionId) || [];
  }

  async addCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = this.currentCaseStudyId++;
    const newCaseStudy: CaseStudy = {
      id,
      sessionId: caseStudy.sessionId,
      illness: caseStudy.illness,
      caseDescription: caseStudy.caseDescription,
      correctDiagnosis: caseStudy.correctDiagnosis,
      correctTreatment: caseStudy.correctTreatment,
      userDiagnosis: caseStudy.userDiagnosis || null,
      userTreatment: caseStudy.userTreatment || null,
      diagnosisScore: caseStudy.diagnosisScore || null,
      treatmentScore: caseStudy.treatmentScore || null,
      feedback: caseStudy.feedback || null,
      isCompleted: caseStudy.isCompleted || false,
      createdAt: new Date(),
    };

    if (!this.caseStudies.has(caseStudy.sessionId)) {
      this.caseStudies.set(caseStudy.sessionId, []);
    }
    this.caseStudies.get(caseStudy.sessionId)!.push(newCaseStudy);
    this.caseStudyById.set(id, newCaseStudy);
    
    return newCaseStudy;
  }

  async updateCaseStudy(id: number, updates: Partial<CaseStudy>): Promise<CaseStudy> {
    const existing = this.caseStudyById.get(id);
    if (!existing) {
      throw new Error(`Case study with id ${id} not found`);
    }

    const updated: CaseStudy = { ...existing, ...updates };
    this.caseStudyById.set(id, updated);

    // Update in session list as well
    const sessionList = this.caseStudies.get(existing.sessionId);
    if (sessionList) {
      const index = sessionList.findIndex(cs => cs.id === id);
      if (index !== -1) {
        sessionList[index] = updated;
      }
    }

    return updated;
  }

  async getCaseStudyById(id: number): Promise<CaseStudy | undefined> {
    return this.caseStudyById.get(id);
  }
}

export const storage = new MemStorage();
