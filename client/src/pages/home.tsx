import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, Trophy, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    setLocation(`/create?name=${encodeURIComponent(playerName)}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    setLocation(`/lobby/${roomCode.toUpperCase()}?name=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-purple/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-cyan/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
            <Sparkles className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-medium text-white">Real-time Multiplayer Quiz</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-display font-extrabold text-white leading-tight">
            Quiz<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">Battle</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-medium">
            Test your knowledge and compete live!
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <Button
            size="lg"
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-neon-purple to-neon-cyan hover:opacity-90 transition-opacity shadow-2xl shadow-neon-purple/50"
            onClick={() => setShowCreateModal(true)}
            data-testid="button-create-room"
          >
            <Users className="w-5 h-5 mr-2" />
            Create Room
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg font-semibold border-2 border-white/30 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20"
            onClick={() => setShowJoinModal(true)}
            data-testid="button-join-room"
          >
            <Zap className="w-5 h-5 mr-2" />
            Join Room
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 p-6 hover-elevate">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-purple to-purple-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multiplayer Rooms</h3>
            <p className="text-white/70">Create or join rooms with unique codes and compete with friends</p>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/20 p-6 hover-elevate">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Updates</h3>
            <p className="text-white/70">See scores update instantly as players answer questions</p>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/20 p-6 hover-elevate">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-correct-answer to-green-600 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Live Leaderboard</h3>
            <p className="text-white/70">Climb to the top with speed bonuses and streak multipliers</p>
          </Card>
        </div>
      </div>

      {/* Create Room Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-card border-card-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Create a Room</DialogTitle>
            <DialogDescription>
              Enter your name to create a new quiz room
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                maxLength={20}
                data-testid="input-player-name-create"
              />
            </div>
            <Button
              onClick={handleCreateRoom}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan"
              disabled={!playerName.trim()}
              data-testid="button-confirm-create"
            >
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Room Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="bg-card border-card-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Join a Room</DialogTitle>
            <DialogDescription>
              Enter the room code and your name to join
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Room Code</label>
              <Input
                placeholder="Enter 6-character code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center font-mono text-2xl tracking-widest"
                data-testid="input-room-code"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                maxLength={20}
                data-testid="input-player-name-join"
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan"
              disabled={!playerName.trim() || roomCode.length !== 6}
              data-testid="button-confirm-join"
            >
              Join Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
