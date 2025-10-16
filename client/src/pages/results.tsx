import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerCard } from "@/components/player-card";
import { Trophy, RotateCcw, Home, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { useWebSocket } from "@/contexts/websocket-context";

export default function Results() {
  const [, params] = useRoute("/results/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const { isConnected, players } = useWebSocket();

  const roomCode = params?.code || "";
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-purple animate-spin mx-auto mb-4" />
          <p className="text-xl text-white font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (winner && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#a855f7', '#06b6d4', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a855f7', '#06b6d4', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [winner, hasTriggeredConfetti]);

  const handlePlayAgain = () => {
    setLocation(`/lobby/${roomCode}`);
  };

  const handleNewQuiz = () => {
    setLocation("/");
  };

  const handleShare = () => {
    const text = `I just played QuizBattle and scored ${winner?.score || 0} points! 🎉 Can you beat me?`;
    if (navigator.share) {
      navigator.share({
        title: "QuizBattle Results",
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Results copied!",
        description: "Share your score with friends",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-display font-bold text-white">
            Quiz<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">Battle</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Winner Announcement */}
        <div className="text-center mb-12 animate-scale-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/50 mb-6">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-display font-bold text-yellow-400">Winner!</span>
          </div>
          
          {winner && (
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-display font-extrabold text-white" data-testid="text-winner-name">
                {winner.name}
              </h2>
              <p className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan" data-testid="text-winner-score">
                {winner.score} points
              </p>
            </div>
          )}
        </div>

        {/* Podium - Top 3 */}
        {sortedPlayers.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            {/* 2nd Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-full">
                <Card className="bg-gradient-to-br from-gray-400/10 to-gray-600/10 border-gray-400/30 p-4 mb-2">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🥈</div>
                    <p className="font-semibold text-white truncate">{sortedPlayers[1].name}</p>
                    <p className="text-2xl font-mono font-bold text-gray-400 mt-1">{sortedPlayers[1].score}</p>
                  </div>
                </Card>
                <div className="h-20 bg-gradient-to-b from-gray-400/20 to-gray-600/20 rounded-lg border border-gray-400/30" />
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-full">
                <Card className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border-yellow-400/30 p-4 mb-2">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🥇</div>
                    <p className="font-semibold text-white truncate">{sortedPlayers[0].name}</p>
                    <p className="text-3xl font-mono font-bold text-yellow-400 mt-1">{sortedPlayers[0].score}</p>
                  </div>
                </Card>
                <div className="h-32 bg-gradient-to-b from-yellow-400/20 to-yellow-600/20 rounded-lg border border-yellow-400/30" />
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="w-full">
                <Card className="bg-gradient-to-br from-orange-400/10 to-orange-600/10 border-orange-400/30 p-4 mb-2">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🥉</div>
                    <p className="font-semibold text-white truncate">{sortedPlayers[2].name}</p>
                    <p className="text-2xl font-mono font-bold text-orange-400 mt-1">{sortedPlayers[2].score}</p>
                  </div>
                </Card>
                <div className="h-16 bg-gradient-to-b from-orange-400/20 to-orange-600/20 rounded-lg border border-orange-400/30" />
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="space-y-4 mb-8">
          <h3 className="text-2xl font-display font-bold text-white">Final Rankings</h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="animate-slide-up" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                <PlayerCard player={player} rank={index + 1} showScore />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-neon-purple to-neon-cyan font-semibold"
            onClick={handlePlayAgain}
            data-testid="button-play-again"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 font-semibold"
            onClick={handleNewQuiz}
            data-testid="button-new-quiz"
          >
            <Home className="w-5 h-5 mr-2" />
            New Quiz
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 font-semibold"
            onClick={handleShare}
            data-testid="button-share"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
}
