"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/AppContext";
import {
  generatePodcast,
  getPodcastExamples,
  getPodcastCollections,
  PodcastCollection,
  PodcastCollectionItem,
  PodcastExchange,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const gradientPalette = [
  { from: "#5ee7df", to: "#b490ca" },
  { from: "#f6d365", to: "#fda085" },
  { from: "#43e97b", to: "#38f9d7" },
  { from: "#a18cd1", to: "#fbc2eb" },
  { from: "#c471f5", to: "#fa71cd" },
  { from: "#ff9a9e", to: "#fad0c4" },
] as const;

type GeneratedSession = {
  id: string;
  topic: string;
  summary: string;
  duration: string;
  gradientFrom: string;
  gradientTo: string;
  exchanges: PodcastExchange[];
};

const estimateDurationFromText = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return "1:30";
  const totalSeconds = Math.max(90, Math.min(900, Math.round(words * 1.3)));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const buildSummary = (dialogue: PodcastExchange[]) => {
  const guestLine = dialogue.find((exchange) => exchange.speaker === "Guest");
  const base = guestLine?.text ?? dialogue[0]?.text ?? "";
  if (!base) return "Freshly generated space story ready to play.";
  return base.length > 140 ? `${base.slice(0, 137)}...` : base;
};

const pickGradient = (index: number) => {
  const palette = gradientPalette[index % gradientPalette.length];
  return { from: palette.from, to: palette.to };
};

const renderSquareCard = (item: PodcastCollectionItem) => (
  <div
    key={item.id}
    className="group flex flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-4 transition-all hover:-translate-y-1 hover:bg-white/10"
  >
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 pb-[100%]"
      style={{
        background: `linear-gradient(140deg, ${item.gradientFrom}, ${item.gradientTo})`,
      }}
    >
      <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
        <Play className="h-3.5 w-3.5" /> Play
      </div>
    </div>
    <div className="space-y-1 text-left">
      <p className="text-base font-semibold text-white">{item.title}</p>
      <p className="text-sm text-zinc-400">{item.subtitle}</p>
    </div>
  </div>
);

const renderCircleCard = (item: PodcastCollectionItem) => (
  <div
    key={item.id}
    className="min-w-[160px] max-w-[180px] flex-1 rounded-3xl border border-white/5 bg-white/5 p-4 text-center transition hover:-translate-y-1 hover:bg-white/10"
  >
    <div
      className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border border-white/10"
      style={{
        background: `linear-gradient(140deg, ${item.gradientFrom}, ${item.gradientTo})`,
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
    </div>
    <p className="text-sm font-semibold text-white">{item.title}</p>
    <p className="text-xs text-zinc-400">{item.subtitle}</p>
  </div>
);

const renderPillCard = (item: PodcastCollectionItem) => (
  <div
    key={item.id}
    className="min-w-[240px] rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:-translate-y-1 hover:bg-white/10"
  >
    <div
      className="rounded-xl p-4 text-left"
      style={{
        background: `linear-gradient(140deg, ${item.gradientFrom}, ${item.gradientTo})`,
        color: item.accent ?? "#0b0d15",
      }}
    >
      <p className="text-sm font-semibold">{item.title}</p>
      <p className="text-xs opacity-80">{item.subtitle}</p>
    </div>
  </div>
);

export default function PodcastPage() {
  const searchParams = useSearchParams();
  const { addToPodcastHistory, podcastHistory } = useAppContext();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState<GeneratedSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GeneratedSession | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const exampleTopics = getPodcastExamples();
  const collections = getPodcastCollections();

  const handleGenerate = async (queryText?: string) => {
    const textToUse = (queryText ?? input).trim();
    if (!textToUse) return;

    setIsGenerating(true);
    try {
      const result = await generatePodcast(textToUse);
      const { from, to } = pickGradient(sessions.length);
      const combinedText = result.map((exchange) => exchange.text).join(" ");
      const newSession: GeneratedSession = {
        id: `${Date.now()}`,
        topic: textToUse,
        summary: buildSummary(result),
        duration: estimateDurationFromText(combinedText),
        gradientFrom: from,
        gradientTo: to,
        exchanges: result,
      };
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      setIsPlaying(true);
      addToPodcastHistory(textToUse);
      setInput("");
    } catch (error) {
      console.error("Failed to generate podcast:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionSelect = (session: GeneratedSession) => {
    setCurrentSession(session);
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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0b0d18] via-[#05070f] to-[#03040a] text-white pb-[140px]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 space-y-12">
        <header className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> Spacecast hub
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">Browse cosmic audio stories</h1>
          <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
            Explore curated collections and spin up new AI-hosted episodes. Your generated podcasts appear as cards below and are ready for playback.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Your sessions</h2>
              <p className="text-sm text-zinc-400">Freshly generated mixes</p>
            </div>
            <button className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 hover:text-white">
              Show all
            </button>
          </div>

          {sessions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSessionSelect(session)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSessionSelect(session);
                  }}
                  className="group relative overflow-hidden rounded-3xl p-5 text-left shadow-lg transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
                  style={{
                    background: `linear-gradient(150deg, ${session.gradientFrom}, ${session.gradientTo})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
                  <div className="relative flex h-full flex-col justify-between gap-6 text-white">
                    <div className="space-y-3">
                      <Badge className="rounded-full border-none bg-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white">
                        Session
                      </Badge>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold leading-tight">{session.topic}</h3>
                        <p className="text-sm text-white/80">{session.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/80">
                      <span className="inline-flex items-center gap-2">
                        <Play className="h-4 w-4" /> Tap to play
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {session.duration}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full border border-white/20 bg-white/10 px-4 text-xs text-white hover:bg-white/20"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCurrentSession(session);
                          setIsDialogOpen(true);
                        }}
                      >
                        View transcript
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-zinc-500">
              Generate a topic below to populate your personalised queue of space biology sessions.
            </div>
          )}
        </section>

        {collections.map((collection: PodcastCollection) => (
          <section key={collection.id} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{collection.title}</h2>
                {collection.description && (
                  <p className="text-sm text-zinc-400">{collection.description}</p>
                )}
              </div>
              <button className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 hover:text-white">
                Show all
              </button>
            </div>

            {collection.layout === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                {collection.items.map((item: PodcastCollectionItem) => renderSquareCard(item))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {collection.itemShape === "circle"
                  ? collection.items.map((item: PodcastCollectionItem) => renderCircleCard(item))
                  : collection.items.map((item: PodcastCollectionItem) => renderPillCard(item))}
              </div>
            )}
          </section>
        ))}

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
              {exampleTopics.map((topic) => (
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
                  {podcastHistory.slice(0, 4).map((topic, index) => (
                    <Button
                      key={`${topic}-${index}`}
                      variant="ghost"
                      className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:bg-emerald-500/10 hover:text-white"
                      onClick={() => {
                        setInput(topic);
                        handleGenerate(topic);
                      }}
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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="hidden h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:block" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {currentSession ? currentSession.topic : "No session playing"}
              </p>
              <p className="text-xs text-zinc-500">
                {currentSession
                  ? currentSession.summary
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
              size="sm"
              className="rounded-full border border-white/10 bg-white/5 px-4 text-xs text-white hover:bg-white/10"
              disabled={!currentSession}
              onClick={() => setIsDialogOpen(true)}
            >
              View transcript
            </Button>
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
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen && !!currentSession} onOpenChange={(open) => setIsDialogOpen(open)}>
        <DialogContent className="max-w-2xl border border-white/10 bg-[#05070f] text-white" showCloseButton>
          {currentSession && (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-semibold text-white">{currentSession.topic}</DialogTitle>
                <DialogDescription className="text-sm text-zinc-400">
                  Generated studio session • {currentSession.duration}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
                {currentSession.exchanges.map((exchange, index) => (
                  <div
                    key={`${exchange.speaker}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <Badge
                      className={cn(
                        "mb-3 rounded-full border-none px-3 py-1 text-xs",
                        exchange.speaker === "Host"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-cyan-500/20 text-cyan-200"
                      )}
                    >
                      {exchange.speaker}
                    </Badge>
                    <p className="text-sm leading-relaxed text-zinc-200">{exchange.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
