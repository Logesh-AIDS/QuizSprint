import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Player } from "@shared/schema";

interface LeaderboardBarProps {
  players: Player[];
  currentPlayerId?: string;
}

export function LeaderboardBar({ players, currentPlayerId }: LeaderboardBarProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <Card className="p-6 bg-card border-card-border h-full">
      <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">
          Leaderboard
        </span>
      </h3>
      
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const isCurrentPlayer = player.id === currentPlayerId;
          const maxScore = sortedPlayers[0]?.score || 1;
          const percentage = (player.score / maxScore) * 100;

          return (
            <div
              key={player.id}
              className={`relative rounded-lg p-3 transition-all ${
                isCurrentPlayer ? 'bg-primary/10 border border-primary/50' : 'bg-muted/50'
              }`}
              data-testid={`leaderboard-entry-${player.id}`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex-shrink-0 w-6 text-center">
                  {getRankBadge(rank) || (
                    <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
                  )}
                </div>

                <Avatar className="w-8 h-8 border border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-cyan text-white text-xs font-semibold">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" data-testid={`text-leaderboard-name-${player.id}`}>
                    {player.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold" data-testid={`text-leaderboard-score-${player.id}`}>
                    {player.score}
                  </span>
                  {player.streak > 1 && (
                    <span className="text-xs text-orange-500 font-semibold">🔥{player.streak}x</span>
                  )}
                </div>
              </div>

              {/* Animated background bar */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div
                  className="h-full bg-gradient-to-r from-primary/20 to-transparent transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        {sortedPlayers.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No players yet
          </p>
        )}
      </div>
    </Card>
  );
}
