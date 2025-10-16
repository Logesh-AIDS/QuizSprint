import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@shared/schema";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendEmoji: (emoji: string) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "💯", "🎉", "😎", "🤔"];

export function ChatPanel({ messages, onSendEmoji }: ChatPanelProps) {
  return (
    <Card className="p-4 bg-white/5 backdrop-blur-xl border-white/20 h-full flex flex-col">
      <h3 className="text-lg font-display font-bold mb-3 text-white">Reactions</h3>
      
      <ScrollArea className="flex-1 mb-3">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-2 animate-slide-up"
              data-testid={`chat-message-${msg.id}`}
            >
              <div className="flex-1 bg-white/10 rounded-lg p-2">
                <p className="text-xs font-semibold text-white/90">{msg.playerName}</p>
                {msg.emoji && (
                  <p className="text-2xl mt-1">{msg.emoji}</p>
                )}
                {msg.message && (
                  <p className="text-sm text-white/80 mt-1">{msg.message}</p>
                )}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-white/50 text-sm py-4">
              No reactions yet
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="grid grid-cols-4 gap-2">
        {QUICK_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            className="text-2xl p-2 h-12 border-white/30 bg-white/10 hover:bg-white/20"
            onClick={() => onSendEmoji(emoji)}
            data-testid={`button-emoji-${emoji}`}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </Card>
  );
}
