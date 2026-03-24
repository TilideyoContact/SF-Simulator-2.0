import { sessions, type Session, type InsertSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSession(id: string, data: Partial<InsertSession>): Promise<Session | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createSession(data: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(data).returning();
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async updateSession(id: string, data: Partial<InsertSession>): Promise<Session | undefined> {
    const [session] = await db.update(sessions).set(data).where(eq(sessions.id, id)).returning();
    return session;
  }
}

export const storage = new DatabaseStorage();
