"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Mic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Download,
  Volume2,
  Sparkles,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { generatePodcastAudio, getPodcastExamples } from "@/lib/api";

const gradientPalette = [
  { from: "#5ee7df", to: "#b490ca" },
  { from: "#f6d365", to: "#fda085" },
  { from: "#43e97b", to: "#38f9d7" },
  { from: "#a18cd1", to: "#fbc2eb" },
  { from: "#c471f5", to: "#fa71cd" },
  { from: "#ff9a9e", to: "#fad0c4" },
] as const;

type PodcastSession = {
  id: string;
  topic: string;
  audioUrl: string;
  gradientFrom: string;
  gradientTo: string;
  duration?: string;
  description: string;
};

const highlightCard = {
  id: "highlight",
  title: "Space Biology Spotlight",
  summary: "Weekly curated mission brief with insights from NASA's latest research logs.",
  gradientFrom: "#3023ae",
  gradientTo: "#c86dd7",
};

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "—";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const pickGradient = (index: number) => {
  const palette = gradientPalette[index % gradientPalette.length];
  return { from: palette.from, to: palette.to };
};

export default function PodcastPage() {
  const searchParams = useSearchParams();
  const {
    addToPodcastHistory,
    podcastHistory,
    setCurrentPodcast,
  } = useAppContext();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState<PodcastSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PodcastSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const exampleTopics = getPodcastExamples();

  const handleGenerate = async (queryText?: string) => {
    const textToUse = (queryText ?? input).trim();
    if (!textToUse) return;

    setIsGenerating(true);
    try {
      if (currentSession) {
        URL.revokeObjectURL(currentSession.audioUrl);
      }

      const audioBlob = await generatePodcastAudio(textToUse);
      const audioUrl = URL.createObjectURL(audioBlob);
      const { from, to } = pickGradient(sessions.length);

      const newSession: PodcastSession = {
        id: `${Date.now()}`,
        topic: textToUse,
        audioUrl,
        gradientFrom: from,
        gradientTo: to,
        description: "Fresh AI-generated episode ready to stream.",
      };

      setSessions([newSession]);
      setCurrentSession(newSession);
      setCurrentPodcast({ topic: textToUse, audioUrl });
      setIsPlaying(true);
      addToPodcastHistory(textToUse);
      setInput("");
    } catch (error) {
      console.error("Failed to generate podcast audio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionSelect = (session: PodcastSession) => {
    setCurrentSession(session);
    setCurrentPodcast({ topic: session.topic, audioUrl: session.audioUrl });
    setIsPlaying(true);
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setInput(query);
      handleGenerate(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSession) {
      if (audio.src !== currentSession.audioUrl) {
        audio.src = currentSession.audioUrl;
      }

      if (isPlaying) {
        audio
          .play()
          .then(() => {
            /* playback started */
          })
          .catch(() => {
            setIsPlaying(false);
          });
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [currentSession, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSession) return;

    const handleLoadedMetadata = () => {
      const formatted = formatDuration(audio.duration);
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSession.id
            ? { ...session, duration: formatted }
            : session
        )
      );
      setCurrentSession((prev) =>
        prev ? { ...prev, duration: formatted } : prev
      );
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentSession]);

  useEffect(() => {
    return () => {
      sessions.forEach((session) => {
        URL.revokeObjectURL(session.audioUrl);
      });
    };
  }, [sessions]);

  const primarySession = sessions[0] ?? null;

  const cardsToShow: Array<
    | { type: "session"; data: PodcastSession }
    | { type: "highlight"; data: typeof highlightCard }
  > = [];

  if (primarySession) {
    cardsToShow.push({ type: "session", data: primarySession });
  }
  cardsToShow.push({ type: "highlight", data: highlightCard });

  const limitedCards = cardsToShow.slice(0, 2);

  const handleDownload = () => {
    if (!currentSession) return;
    const link = document.createElement("a");
    link.href = currentSession.audioUrl;
    const safeTopic = currentSession.topic.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    link.download = `${safeTopic || "podcast"}.wav`;
    link.click();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b0d18] via-[#05070f] to-[#03040a] text-white pb-[140px]">
      <audio ref={audioRef} hidden />
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-12 space-y-12">
        <header className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> Spacecast hub
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">Your space stories</h1>
          <p className="max-w-xl text-sm text-zinc-400 sm:text-base">
            Keep it simple: the newest mix you generate and a single editor highlight are front and centre.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {limitedCards.map((card) => {
            if (card.type === "session") {
              const session = card.data;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSessionSelect(session)}
                  className="group relative overflow-hidden rounded-3xl p-6 text-left shadow-lg transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                  style={{
                    background: `linear-gradient(150deg, ${session.gradientFrom}, ${session.gradientTo})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
                  <div className="relative flex h-full flex-col justify-between gap-6 text-white">
                    <div className="space-y-3">
                      <Badge className="rounded-full border-none bg-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white">
                        Latest session
                      </Badge>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold leading-tight">{session.topic}</h3>
                        <p className="text-sm text-white/80">{session.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/80">
                      <span className="inline-flex items-center gap-2">
                        <Play className="h-4 w-4" /> Tap to play
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {session.duration ?? "—"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            }

            const highlight = card.data;
            return (
              <div
                key={highlight.id}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg"
              >
                <div className="space-y-3">
                  <Badge className="rounded-full border-none bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white">
                    Spotlight
                  </Badge>
                  <h3 className="text-2xl font-semibold text-white">{highlight.title}</h3>
                  <p className="text-sm text-zinc-300">{highlight.summary}</p>
                </div>
                <div
                  className="mt-6 rounded-2xl p-5 text-sm text-white"
                  style={{
                    background: `linear-gradient(150deg, ${highlight.gradientFrom}, ${highlight.gradientTo})`,
                  }}
                >
                  <p className="mb-4 font-semibold uppercase tracking-[0.3em] text-white/80">
                    Quick listen ideas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exampleTopics.slice(0, 2).map((topic) => (
                      <Button
                        key={topic}
                        variant="ghost"
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                        onClick={() => handleGenerate(topic)}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Create a new podcast</h2>
              <p className="text-sm text-zinc-400">
                Describe a topic and we will assemble a host and guest conversation ready for listening.
              </p>
            </div>
            <Textarea
              placeholder="e.g., How do plants grow in space? Explain the effects of microgravity on plant root systems..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-32 resize-none rounded-2xl border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500"
            />
            <div className="flex flex-wrap gap-2">
              {exampleTopics.slice(0, 3).map((topic) => (
                <Button
                  key={topic}
                  variant="ghost"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-emerald-500/10 hover:text-white"
                  onClick={() => setInput(topic)}
                >
                  {topic}
                </Button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {podcastHistory.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="uppercase tracking-[0.3em] text-zinc-600">Recent</span>
                  {podcastHistory.slice(0, 3).map((topic, index) => (
                    <Button
                      key={`${topic}-${index}`}
                      variant="ghost"
                      className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-emerald-500/10 hover:text-white"
                      onClick={() => handleGenerate(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              )}
              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !input.trim()}
                className="h-11 w-full gap-2 rounded-full bg-emerald-500 px-6 text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 sm:w-auto"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Mixing session...
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Generate session
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#05070f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="hidden h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:block" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {currentSession ? currentSession.topic : "No session playing"}
              </p>
              <p className="text-xs text-zinc-500">
                {currentSession
                  ? currentSession.description
                  : "Generate a podcast to start listening."}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
              disabled={!currentSession}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/10 bg-emerald-500 text-black hover:bg-emerald-400"
              disabled={!currentSession}
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
              disabled={!currentSession}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
              disabled={!currentSession}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
              disabled={!currentSession}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
