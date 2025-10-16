import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Crown, Check } from "lucide-react";
import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  rank?: number;
  showScore?: boolean;
}

export function PlayerCard({ player, rank, showScore = false }: PlayerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankColor = (rank?: number) => {
    if (!rank) return "";
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-300 to-gray-500";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "";
  };

  return (
    <Card className={`p-4 hover-elevate transition-all ${rank && rank <= 3 ? `bg-gradient-to-br ${getRankColor(rank)}/10 border-${rank === 1 ? 'yellow' : rank === 2 ? 'gray' : 'orange'}-400/50` : ''}`}>
      <div className="flex items-center gap-3">
        {rank && (
          <div className="flex-shrink-0 text-2xl font-display font-bold text-muted-foreground">
            {rank <= 3 && rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
          </div>
        )}
        
        <Avatar className="w-10 h-10 border-2 border-primary/50">
          <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-cyan text-white font-semibold">
            {getInitials(player.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground truncate" data-testid={`text-player-name-${player.id}`}>
              {player.name}
            </p>
            {player.isHost && (
              <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          {showScore && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-muted-foreground" data-testid={`text-score-${player.id}`}>
                {player.score} pts
              </span>
              {player.streak > 1 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  🔥 {player.streak}x
                </Badge>
              )}
            </div>
          )}
        </div>

        {player.ready && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-correct-answer/20 border border-correct-answer flex items-center justify-center">
              <Check className="w-5 h-5 text-correct-answer" data-testid={`icon-ready-${player.id}`} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
