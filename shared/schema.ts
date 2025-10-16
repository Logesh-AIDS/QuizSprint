import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Room schema
export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 6 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("lobby"), // lobby, playing, finished
  currentQuestion: integer("current_question").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player schema
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  roomId: varchar("room_id").notNull(),
  score: integer("score").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  ready: boolean("ready").notNull().default(false),
  isHost: boolean("is_host").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Question schema (in-memory, not persisted)
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number; // in seconds
  category?: string;
}

// Answer schema (in-memory tracking)
export interface Answer {
  playerId: string;
  questionId: number;
  selectedAnswer: number;
  timeTaken: number; // in milliseconds
  isCorrect: boolean;
  pointsEarned: number;
}

// Chat message schema (in-memory)
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message?: string;
  emoji?: string;
  timestamp: number;
}

// WebSocket message types
export type WSMessageType = 
  | "join_room"
  | "leave_room"
  | "player_ready"
  | "start_game"
  | "send_question"
  | "submit_answer"
  | "update_scores"
  | "game_finished"
  | "send_chat"
  | "send_emoji";

export interface WSMessage {
  type: WSMessageType;
  payload: any;
}

// Insert schemas
export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  joinedAt: true,
});

// Extended validation schemas
export const joinRoomSchema = z.object({
  code: z.string().length(6, "Room code must be 6 characters"),
  playerName: z.string().min(1, "Name is required").max(20, "Name too long"),
});

export const createRoomSchema = z.object({
  playerName: z.string().min(1, "Name is required").max(20, "Name too long"),
});

// Types
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type JoinRoom = z.infer<typeof joinRoomSchema>;
export type CreateRoom = z.infer<typeof createRoomSchema>;

// Question bank (sample questions)
export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    timeLimit: 15,
    category: "Geography"
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    timeLimit: 15,
    category: "Science"
  },
  {
    id: 3,
    text: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2,
    timeLimit: 15,
    category: "Art"
  },
  {
    id: 4,
    text: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: 3,
    timeLimit: 15,
    category: "Geography"
  },
  {
    id: 5,
    text: "In what year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    timeLimit: 15,
    category: "History"
  },
  {
    id: 6,
    text: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: 2,
    timeLimit: 15,
    category: "Math"
  },
  {
    id: 7,
    text: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: 1,
    timeLimit: 15,
    category: "Science"
  },
  {
    id: 8,
    text: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1,
    timeLimit: 15,
    category: "Literature"
  },
  {
    id: 9,
    text: "What is the speed of light in vacuum?",
    options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
    correctAnswer: 0,
    timeLimit: 15,
    category: "Science"
  },
  {
    id: 10,
    text: "Which country is home to the kangaroo?",
    options: ["New Zealand", "South Africa", "Australia", "Brazil"],
    correctAnswer: 2,
    timeLimit: 15,
    category: "Geography"
  }
];
