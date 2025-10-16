import { type Room, type Player, type InsertRoom, type InsertPlayer, type Question, type Answer, type ChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(id: string): Promise<Room | undefined>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<void>;

  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByRoom(roomId: string): Promise<Player[]>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<void>;
  deletePlayersByRoom(roomId: string): Promise<void>;

  // In-memory game state
  getAnswer(playerId: string, questionId: number): Promise<Answer | undefined>;
  saveAnswer(answer: Answer): Promise<void>;
  getAnswersByQuestion(roomId: string, questionId: number): Promise<Answer[]>;
  clearAnswers(roomId: string): Promise<void>;

  getChatMessages(roomId: string): Promise<ChatMessage[]>;
  addChatMessage(message: ChatMessage): Promise<void>;
  clearChatMessages(roomId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private players: Map<string, Player>;
  private answers: Map<string, Answer[]>; // key: roomId
  private chatMessages: Map<string, ChatMessage[]>; // key: roomId

  constructor() {
    this.rooms = new Map();
    this.players = new Map();
    this.answers = new Map();
    this.chatMessages = new Map();
  }

  // Room operations
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const room: Room = {
      ...insertRoom,
      id,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(
      (room) => room.code === code,
    );
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    const updated = { ...room, ...updates };
    this.rooms.set(id, updated);
    return updated;
  }

  async deleteRoom(id: string): Promise<void> {
    this.rooms.delete(id);
  }

  // Player operations
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      ...insertPlayer,
      id,
      joinedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByRoom(roomId: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      (player) => player.roomId === roomId,
    );
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    const updated = { ...player, ...updates };
    this.players.set(id, updated);
    return updated;
  }

  async deletePlayer(id: string): Promise<void> {
    this.players.delete(id);
  }

  async deletePlayersByRoom(roomId: string): Promise<void> {
    const players = await this.getPlayersByRoom(roomId);
    players.forEach(player => this.players.delete(player.id));
  }

  // Answer operations
  async getAnswer(playerId: string, questionId: number): Promise<Answer | undefined> {
    const allAnswers = Array.from(this.answers.values()).flat();
    return allAnswers.find(
      (answer) => answer.playerId === playerId && answer.questionId === questionId,
    );
  }

  async saveAnswer(answer: Answer): Promise<void> {
    const player = await this.getPlayer(answer.playerId);
    if (!player) return;

    const roomAnswers = this.answers.get(player.roomId) || [];
    roomAnswers.push(answer);
    this.answers.set(player.roomId, roomAnswers);
  }

  async getAnswersByQuestion(roomId: string, questionId: number): Promise<Answer[]> {
    const roomAnswers = this.answers.get(roomId) || [];
    return roomAnswers.filter((answer) => answer.questionId === questionId);
  }

  async clearAnswers(roomId: string): Promise<void> {
    this.answers.delete(roomId);
  }

  // Chat operations
  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(roomId) || [];
  }

  async addChatMessage(message: ChatMessage): Promise<void> {
    const messages = this.chatMessages.get(message.id.split('-')[0]) || [];
    messages.push(message);
    this.chatMessages.set(message.id.split('-')[0], messages);
  }

  async clearChatMessages(roomId: string): Promise<void> {
    this.chatMessages.delete(roomId);
  }
}

export const storage = new MemStorage();
