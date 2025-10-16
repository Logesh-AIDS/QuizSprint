import { useEffect } from "react";
import { useLocation, useRoute, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerCard } from "@/components/player-card";
import { ChatPanel } from "@/components/chat-panel";
import { Users, Copy, Check, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/contexts/websocket-context";
import { useState } from "react";

export default function Lobby() {
  const [, params] = useRoute("/lobby/:code");
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const {
    isConnected,
    currentPlayer,
    currentRoom,
    players,
    chatMessages,
    currentQuestion,
    joinRoom,
    setPlayerReady,
    startGame,
    sendEmoji,
  } = useWebSocket();

  const roomCode = params?.code || "";
  const playerName = searchParams.get("name") || "";
  const isHost = searchParams.get("host") === "true";

  // Join room on mount
  useEffect(() => {
    if (isConnected && roomCode && playerName) {
      joinRoom(roomCode, playerName, isHost);
    }
  }, [isConnected, roomCode, playerName, isHost, joinRoom]);

  // Navigate to quiz when game starts
  useEffect(() => {
    if (currentQuestion) {
      setLocation(`/quiz/${roomCode}`);
    }
  }, [currentQuestion, roomCode, setLocation]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast({
      title: "Room code copied!",
      description: "Share it with your friends to join",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReady = () => {
    setPlayerReady();
  };

  const handleSendEmoji = (emoji: string) => {
    sendEmoji(emoji);
  };

  const handleStartGame = () => {
    startGame();
  };

  const allReady = players.length > 0 && players.every(p => p.ready);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-purple animate-spin mx-auto mb-4" />
          <p className="text-xl text-white font-medium">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-display font-bold text-white">
                Quiz<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">Battle</span>
              </h1>
              <div className="hidden sm:flex items-center gap-2 text-white/70">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium" data-testid="text-player-count">{players.length} Players</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Card className="bg-white/10 backdrop-blur-xl border-white/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/70">Room Code</span>
                  <span className="text-2xl font-mono font-bold text-white tracking-widest" data-testid="text-room-code">
                    {roomCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyRoomCode}
                    className="text-white hover:bg-white/20"
                    data-testid="button-copy-code"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-white">
                Waiting for Players...
              </h2>
              {isHost && allReady && (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-neon-purple to-neon-cyan font-semibold"
                  onClick={handleStartGame}
                  data-testid="button-start-game"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
              
              {players.length === 0 && (
                <Card className="col-span-2 p-12 bg-white/5 backdrop-blur-xl border-white/20 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-white/70 text-lg">
                    Waiting for players to join...
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    Share the room code with your friends!
                  </p>
                </Card>
              )}
            </div>

            {!currentPlayer?.ready && currentPlayer && (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-correct-answer to-green-600 font-semibold"
                onClick={handleReady}
                data-testid="button-ready"
              >
                <Check className="w-5 h-5 mr-2" />
                I'm Ready!
              </Button>
            )}

            {currentPlayer?.ready && !allReady && (
              <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/20">
                <p className="text-center text-white/70">
                  Waiting for other players to get ready...
                </p>
              </Card>
            )}
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ChatPanel messages={chatMessages} onSendEmoji={handleSendEmoji} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
