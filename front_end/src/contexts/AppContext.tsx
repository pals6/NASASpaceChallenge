"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Podcast playback
  currentPodcast: {
    topic: string;
    audioUrl: string;
  } | null;
  setCurrentPodcast: (podcast: { topic: string; audioUrl: string } | null) => void;
  
  // Flash cards state
  flashcardsProgress: {
    score: number;
    answered: number[];
  };
  updateFlashcardsScore: (score: number) => void;
  addAnsweredCard: (cardId: number) => void;
  resetFlashcards: () => void;
  
  // Podcast state
  podcastHistory: string[];
  addToPodcastHistory: (topic: string) => void;

  // Comic state
  comicHistory: string[];
  addToComicHistory: (story: string) => void;
  
  // Timeline state
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  
  // Graph state
  selectedNode: string | null;
  setSelectedNode: (nodeId: string | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState("/");
  const [currentPodcast, setCurrentPodcast] = useState<{
    topic: string;
    audioUrl: string;
  } | null>(null);
  
  // Flash cards state
  const [flashcardsProgress, setFlashcardsProgress] = useState({
    score: 0,
    answered: [] as number[],
  });
  
  // History states
  const [podcastHistory, setPodcastHistory] = useState<string[]>([]);
  const [comicHistory, setComicHistory] = useState<string[]>([]);
  
  // Selection states
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const updateFlashcardsScore = (score: number) => {
    setFlashcardsProgress((prev) => ({ ...prev, score }));
  };

  const addAnsweredCard = (cardId: number) => {
    setFlashcardsProgress((prev) => ({
      ...prev,
      answered: [...prev.answered, cardId],
    }));
  };

  const resetFlashcards = () => {
    setFlashcardsProgress({ score: 0, answered: [] });
  };

  const addToPodcastHistory = (topic: string) => {
    setPodcastHistory((prev) => [topic, ...prev].slice(0, 10)); // Keep last 10
  };

  const addToComicHistory = (story: string) => {
    setComicHistory((prev) => [story, ...prev].slice(0, 10)); // Keep last 10
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentPodcast,
        setCurrentPodcast,
        flashcardsProgress,
        updateFlashcardsScore,
        addAnsweredCard,
        resetFlashcards,
        podcastHistory,
        addToPodcastHistory,
        comicHistory,
        addToComicHistory,
        selectedYear,
        setSelectedYear,
        selectedNode,
        setSelectedNode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
