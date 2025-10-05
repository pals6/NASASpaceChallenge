"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, RotateCw, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { getFlashCards, getDifficultyColors } from "@/lib/api";

export default function FlashCardsPage() {
  const { 
    flashcardsProgress, 
    updateFlashcardsScore, 
    addAnsweredCard, 
    resetFlashcards 
  } = useAppContext();
  
  const flashcards = getFlashCards();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = flashcards[currentCard];
  const { score, answered } = flashcardsProgress;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnew = () => {
    if (!answered.includes(card.id)) {
      updateFlashcardsScore(score + 1);
      addAnsweredCard(card.id);
    }
    nextCard();
  };

  const handleDidntKnow = () => {
    if (!answered.includes(card.id)) {
      addAnsweredCard(card.id);
    }
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  const resetProgress = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    resetFlashcards();
  };

  const difficultyColors = getDifficultyColors();

  const progress = ((answered.length / flashcards.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Flash Cards</h1>
            <p className="text-muted-foreground">
              Test your space biology knowledge
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <Card className="flex-1 rounded-xl">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {answered.length} / {flashcards.length}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </CardContent>
          </Card>
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-xl"
            onClick={resetProgress}
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Flash Card */}
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Badge variant="secondary" className="rounded-lg">
            {card.category}
          </Badge>
          <Badge className={`rounded-lg ${difficultyColors[card.difficulty]}`}>
            {card.difficulty}
          </Badge>
        </div>

        <div className="perspective-1000">
          <Card
            className={`relative h-96 rounded-2xl cursor-pointer transition-all duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={handleFlip}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Question</p>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{card.question}</h2>
                <p className="text-sm text-muted-foreground">Click to reveal answer</p>
              </CardContent>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 backface-hidden bg-gradient-to-br from-red-500/10 to-rose-500/10"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Answer</p>
                </div>
                <p className="text-lg md:text-xl leading-relaxed">{card.answer}</p>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl gap-2"
            onClick={prevCard}
            disabled={currentCard === 0}
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </Button>

          {isFlipped && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl"
                onClick={handleDidntKnow}
              >
                Didn't Know
              </Button>
              <Button
                size="lg"
                className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500"
                onClick={handleKnew}
              >
                I Knew It!
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="lg"
            className="rounded-xl gap-2"
            onClick={nextCard}
            disabled={currentCard === flashcards.length - 1}
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Card Counter */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Card {currentCard + 1} of {flashcards.length}
          </p>
        </div>
      </div>
    </div>
  );
}
