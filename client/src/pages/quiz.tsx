import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimerBar } from "@/components/timer-bar";
import { LeaderboardBar } from "@/components/leaderboard-bar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";
import { useWebSocket } from "@/contexts/websocket-context";

export default function Quiz() {
  const [, params] = useRoute("/quiz/:code");
  const [, setLocation] = useLocation();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(Date.now());

  const {
    isConnected,
    currentPlayer,
    players,
    currentQuestion,
    questionNumber,
    totalQuestions,
    answerResult,
    gameFinished,
    submitAnswer,
  } = useWebSocket();

  const roomCode = params?.code || "";

  // Navigate to results when game finishes
  useEffect(() => {
    if (gameFinished) {
      setLocation(`/results/${roomCode}`);
    }
  }, [gameFinished, roomCode, setLocation]);

  // Show feedback when answer result arrives and only if user has answered or timed out
  useEffect(() => {
    if (answerResult && isAnswered) {
      setShowFeedback(true);
    }
  }, [answerResult, isAnswered]);

  // Reset for new question
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowFeedback(false);
      setAnswerStartTime(Date.now());
    }
  }, [currentQuestion?.id]);

  const handleSelectAnswer = (index: number) => {
    if (isAnswered || !currentQuestion) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);

    const timeTaken = Date.now() - answerStartTime;
    submitAnswer(currentQuestion.id, index, timeTaken);
  };

  const handleTimeout = () => {
    if (!isAnswered && currentQuestion) {
      setIsAnswered(true);
      const timeTaken = Date.now() - answerStartTime;
      submitAnswer(currentQuestion.id, -1, timeTaken); // -1 indicates no answer
    }
  };

  const isCorrect = answerResult?.isCorrect || false;

  if (!isConnected || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-purple animate-spin mx-auto mb-4" />
          <p className="text-xl text-white font-medium">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-blue-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-white">
              Quiz<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">Battle</span>
            </h1>
            <Badge className="bg-white/10 backdrop-blur-xl border-white/30 text-white text-base px-4 py-1">
              Question {questionNumber}/{totalQuestions}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            <TimerBar
              key={currentQuestion.id}
              duration={currentQuestion?.timeLimit || 15}
              onTimeout={handleTimeout}
              isRunning={!isAnswered}
            />

            {/* Question */}
            <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/20">
              {currentQuestion?.category && (
                <Badge className="mb-4 bg-neon-purple/20 text-neon-purple border-neon-purple/50">
                  {currentQuestion.category}
                </Badge>
              )}
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight" data-testid="text-question">
                {currentQuestion?.text}
              </h2>
            </Card>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion?.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = currentQuestion.correctAnswer === index;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showWrong = showFeedback && isSelected && !isCorrectAnswer;

                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    className={`min-h-16 text-lg font-semibold transition-all ${
                      showCorrect
                        ? "bg-correct-answer/20 border-correct-answer text-white animate-pulse"
                        : showWrong
                        ? "bg-wrong-answer/20 border-wrong-answer text-white animate-shake"
                        : isSelected
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-white/10 border-white/30 text-white hover:bg-white/20"
                    }`}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isAnswered}
                    data-testid={`button-answer-${index}`}
                  >
                    <div className="flex items-center justify-between w-full gap-3">
                      <span className="text-left flex-1">{option}</span>
                      {showCorrect && <Check className="w-6 h-6 text-correct-answer flex-shrink-0" />}
                      {showWrong && <X className="w-6 h-6 text-wrong-answer flex-shrink-0" />}
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && answerResult && (
              <Card className={`p-6 ${
                isCorrect
                  ? "bg-correct-answer/10 border-correct-answer/50"
                  : "bg-wrong-answer/10 border-wrong-answer/50"
              } animate-scale-in`}>
                <p className={`text-center text-xl font-semibold ${
                  isCorrect ? "text-correct-answer" : "text-wrong-answer"
                }`}>
                  {isCorrect ? "🎉 Correct!" : "❌ Wrong Answer"}
                </p>
                <p className="text-center text-white/70 mt-2">
                  {isCorrect
                    ? `+${answerResult.pointsEarned} points! Moving to the next question...`
                    : `The correct answer was: ${currentQuestion?.options[answerResult.correctAnswer]}`
                  }
                </p>
              </Card>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LeaderboardBar players={players} currentPlayerId={currentPlayer?.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
