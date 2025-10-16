import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import type { Player, Room, Question, ChatMessage, WSMessage } from "@shared/schema";

interface WebSocketContextType {
  isConnected: boolean;
  currentPlayer: Player | null;
  currentRoom: Room | null;
  players: Player[];
  chatMessages: ChatMessage[];
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
  answerResult: {
    isCorrect: boolean;
    correctAnswer: number;
    pointsEarned: number;
    newScore: number;
  } | null;
  gameFinished: boolean;
  error: string | null;
  joinRoom: (roomCode: string, playerName: string, isHost?: boolean) => void;
  setPlayerReady: () => void;
  startGame: () => void;
  submitAnswer: (questionId: number, selectedAnswer: number, timeTaken: number) => void;
  sendEmoji: (emoji: string) => void;
  leaveRoom: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'joined':
            setCurrentPlayer(message.payload.player);
            setCurrentRoom(message.payload.room);
            break;

          case 'players_updated':
            setPlayers(message.payload.players);
            break;

          case 'send_question':
            setCurrentQuestion(message.payload.question);
            setQuestionNumber(message.payload.questionNumber);
            setTotalQuestions(message.payload.totalQuestions);
            setAnswerResult(null);
            break;

          case 'answer_result':
            setAnswerResult(message.payload);
            break;

          case 'update_scores':
            setPlayers(message.payload.players);
            break;

          case 'chat_message':
            setChatMessages((prev) => [...prev, message.payload.message]);
            break;

          case 'game_finished':
            setPlayers(message.payload.players);
            setGameFinished(true);
            break;

          case 'error':
            setError(message.payload.message);
            break;
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Connection error');
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string, isHost = false) => {
    sendMessage({
      type: 'join_room',
      payload: { roomCode, playerName, isHost }
    });
  }, [sendMessage]);

  const setPlayerReady = useCallback(() => {
    sendMessage({
      type: 'player_ready',
      payload: {}
    });
  }, [sendMessage]);

  const startGame = useCallback(() => {
    sendMessage({
      type: 'start_game',
      payload: {}
    });
  }, [sendMessage]);

  const submitAnswer = useCallback((questionId: number, selectedAnswer: number, timeTaken: number) => {
    sendMessage({
      type: 'submit_answer',
      payload: { questionId, selectedAnswer, timeTaken }
    });
  }, [sendMessage]);

  const sendEmoji = useCallback((emoji: string) => {
    sendMessage({
      type: 'send_emoji',
      payload: { emoji }
    });
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    sendMessage({
      type: 'leave_room',
      payload: {}
    });
  }, [sendMessage]);

  const value = {
    isConnected,
    currentPlayer,
    currentRoom,
    players,
    chatMessages,
    currentQuestion,
    questionNumber,
    totalQuestions,
    answerResult,
    gameFinished,
    error,
    joinRoom,
    setPlayerReady,
    startGame,
    submitAnswer,
    sendEmoji,
    leaveRoom,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
