import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { SAMPLE_QUESTIONS, type WSMessage, type Question, type Answer } from "@shared/schema";

// Track WebSocket connections by player ID
const playerConnections = new Map<string, WebSocket>();
const roomConnections = new Map<string, Set<string>>(); // roomId -> Set of playerIds
const roomQuestions = new Map<string, Question[]>(); // roomId -> questions array
const questionTimers = new Map<string, NodeJS.Timeout>(); // roomId -> timer

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server on /ws path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentPlayerId: string | null = null;
    let currentRoomId: string | null = null;

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('message', async (data: string) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        switch (message.type) {
          case 'join_room': {
            const { roomCode, playerName, isHost } = message.payload;
            
            // Check if room exists, create if needed
            let room = await storage.getRoomByCode(roomCode);
            
            if (!room) {
              // Create new room
              room = await storage.createRoom({
                code: roomCode,
                status: 'lobby',
                currentQuestion: 0,
              });
            }

            // Check if room is full or game already started
            const players = await storage.getPlayersByRoom(room.id);
            if (room.status !== 'lobby') {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Game already in progress' }
              }));
              return;
            }

            // Create player
            const player = await storage.createPlayer({
              name: playerName,
              roomId: room.id,
              score: 0,
              streak: 0,
              ready: false,
              isHost: isHost || players.length === 0, // First player is host
            });

            currentPlayerId = player.id;
            currentRoomId = room.id;

            // Store connection
            playerConnections.set(player.id, ws);
            if (!roomConnections.has(room.id)) {
              roomConnections.set(room.id, new Set());
            }
            roomConnections.get(room.id)!.add(player.id);

            // Send current player info
            ws.send(JSON.stringify({
              type: 'joined',
              payload: { player, room }
            }));

            // Broadcast updated player list to all in room
            await broadcastToRoom(room.id, {
              type: 'players_updated',
              payload: { players: await storage.getPlayersByRoom(room.id) }
            });

            break;
          }

          case 'player_ready': {
            if (!currentPlayerId || !currentRoomId) return;

            const player = await storage.updatePlayer(currentPlayerId, { ready: true });
            
            // Broadcast updated player list
            await broadcastToRoom(currentRoomId, {
              type: 'players_updated',
              payload: { players: await storage.getPlayersByRoom(currentRoomId) }
            });

            break;
          }

          case 'start_game': {
            if (!currentPlayerId || !currentRoomId) return;

            const player = await storage.getPlayer(currentPlayerId);
            if (!player?.isHost) return;

            const room = await storage.getRoom(currentRoomId);
            if (!room) return;

            // Shuffle and select questions
            const shuffled = [...SAMPLE_QUESTIONS].sort(() => Math.random() - 0.5);
            const gameQuestions = shuffled.slice(0, 10);
            roomQuestions.set(currentRoomId, gameQuestions);

            // Update room status
            await storage.updateRoom(currentRoomId, { status: 'playing', currentQuestion: 0 });

            // Send first question
            await sendQuestion(currentRoomId, 0);

            break;
          }

          case 'submit_answer': {
            if (!currentPlayerId || !currentRoomId) return;

            const { questionId, selectedAnswer, timeTaken } = message.payload;
            const questions = roomQuestions.get(currentRoomId);
            const question = questions?.find(q => q.id === questionId);
            
            if (!question) return;

            const isCorrect = question.correctAnswer === selectedAnswer;
            
            // Calculate points (base 100, speed bonus up to 50, streak multiplier)
            let points = 0;
            if (isCorrect) {
              const basePoints = 100;
              const speedBonus = Math.floor((1 - timeTaken / (question.timeLimit * 1000)) * 50);
              points = basePoints + speedBonus;
            }

            const player = await storage.getPlayer(currentPlayerId);
            if (!player) return;

            // Update streak
            const newStreak = isCorrect ? player.streak + 1 : 0;
            const streakMultiplier = Math.min(Math.floor(newStreak / 3), 3); // Max 3x
            const finalPoints = points * (1 + streakMultiplier * 0.5);

            // Update player score
            await storage.updatePlayer(currentPlayerId, {
              score: player.score + Math.floor(finalPoints),
              streak: newStreak,
            });

            // Save answer
            const answer: Answer = {
              playerId: currentPlayerId,
              questionId,
              selectedAnswer,
              timeTaken,
              isCorrect,
              pointsEarned: Math.floor(finalPoints),
            };
            await storage.saveAnswer(answer);

            // Send feedback to player
            ws.send(JSON.stringify({
              type: 'answer_result',
              payload: {
                isCorrect,
                correctAnswer: question.correctAnswer,
                pointsEarned: Math.floor(finalPoints),
                newScore: player.score + Math.floor(finalPoints),
              }
            }));

            // Check if all players answered
            const answers = await storage.getAnswersByQuestion(currentRoomId, questionId);
            const players = await storage.getPlayersByRoom(currentRoomId);
            
            if (answers.length === players.length) {
              // Clear timeout for this question
              const timer = questionTimers.get(currentRoomId);
              if (timer) {
                clearTimeout(timer);
                questionTimers.delete(currentRoomId);
              }

              // Move to next question or end game
              const room = await storage.getRoom(currentRoomId);
              const nextQuestionIndex = (room?.currentQuestion || 0) + 1;
              const totalQuestions = roomQuestions.get(currentRoomId)?.length || 0;

              if (nextQuestionIndex >= totalQuestions) {
                await endGame(currentRoomId);
              } else {
                await storage.updateRoom(currentRoomId, { currentQuestion: nextQuestionIndex });
                setTimeout(() => sendQuestion(currentRoomId, nextQuestionIndex), 2000);
              }
            }

            // Broadcast updated scores
            await broadcastToRoom(currentRoomId, {
              type: 'update_scores',
              payload: { players: await storage.getPlayersByRoom(currentRoomId) }
            });

            break;
          }

          case 'send_emoji': {
            if (!currentPlayerId || !currentRoomId) return;

            const { emoji } = message.payload;
            const player = await storage.getPlayer(currentPlayerId);
            if (!player) return;

            const chatMessage = {
              id: `${currentRoomId}-${Date.now()}-${Math.random()}`,
              playerId: currentPlayerId,
              playerName: player.name,
              emoji,
              timestamp: Date.now(),
            };

            await storage.addChatMessage(chatMessage);

            await broadcastToRoom(currentRoomId, {
              type: 'chat_message',
              payload: { message: chatMessage }
            });

            break;
          }

          case 'leave_room': {
            if (currentPlayerId && currentRoomId) {
              await handleDisconnect(currentPlayerId, currentRoomId);
            }
            break;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      if (currentPlayerId && currentRoomId) {
        await handleDisconnect(currentPlayerId, currentRoomId);
      }
    });
  });

  async function sendQuestion(roomId: string, questionIndex: number) {
    const questions = roomQuestions.get(roomId);
    if (!questions || questionIndex >= questions.length) return;

    const question = questions[questionIndex];
    
    // Send question to all players (without correct answer)
    await broadcastToRoom(roomId, {
      type: 'send_question',
      payload: {
        question: {
          id: question.id,
          text: question.text,
          options: question.options,
          timeLimit: question.timeLimit,
          category: question.category,
        },
        questionNumber: questionIndex + 1,
        totalQuestions: questions.length,
      }
    });

    // Set timeout for question
    const timer = setTimeout(async () => {
      const room = await storage.getRoom(roomId);
      const nextQuestionIndex = (room?.currentQuestion || 0) + 1;
      const totalQuestions = roomQuestions.get(roomId)?.length || 0;

      if (nextQuestionIndex >= totalQuestions) {
        await endGame(roomId);
      } else {
        await storage.updateRoom(roomId, { currentQuestion: nextQuestionIndex });
        await sendQuestion(roomId, nextQuestionIndex);
      }
    }, (question.timeLimit + 2) * 1000); // Add 2s buffer

    questionTimers.set(roomId, timer);
  }

  async function endGame(roomId: string) {
    const timer = questionTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      questionTimers.delete(roomId);
    }

    await storage.updateRoom(roomId, { status: 'finished' });

    await broadcastToRoom(roomId, {
      type: 'game_finished',
      payload: { players: await storage.getPlayersByRoom(roomId) }
    });
  }

  async function broadcastToRoom(roomId: string, message: WSMessage) {
    const playerIds = roomConnections.get(roomId);
    if (!playerIds) return;

    const messageStr = JSON.stringify(message);
    
    for (const playerId of playerIds) {
      const ws = playerConnections.get(playerId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    }
  }

  async function handleDisconnect(playerId: string, roomId: string) {
    // Remove from connections
    playerConnections.delete(playerId);
    roomConnections.get(roomId)?.delete(playerId);

    // Delete player
    await storage.deletePlayer(playerId);

    // Check if room is empty
    const players = await storage.getPlayersByRoom(roomId);
    if (players.length === 0) {
      // Clean up room
      await storage.deleteRoom(roomId);
      await storage.clearAnswers(roomId);
      await storage.clearChatMessages(roomId);
      roomQuestions.delete(roomId);
      roomConnections.delete(roomId);
      const timer = questionTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        questionTimers.delete(roomId);
      }
    } else {
      // Check if host left, assign new host
      const hasHost = players.some(p => p.isHost);
      if (!hasHost && players.length > 0) {
        await storage.updatePlayer(players[0].id, { isHost: true });
      }

      // Broadcast updated player list
      await broadcastToRoom(roomId, {
        type: 'players_updated',
        payload: { players: await storage.getPlayersByRoom(roomId) }
      });
    }
  }

  return httpServer;
}
