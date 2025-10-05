"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, Play, Download, Sparkles } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { generatePodcast, getPodcastExamples, PodcastExchange } from "@/lib/api";

export default function PodcastPage() {
  const searchParams = useSearchParams();
  const { addToPodcastHistory, podcastHistory } = useAppContext();
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exchanges, setExchanges] = useState<PodcastExchange[]>([]);

  const handleGenerate = async (queryText?: string) => {
    const textToUse = queryText || input;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generatePodcast(textToUse);
      setExchanges(result);
      addToPodcastHistory(textToUse);
    } catch (error) {
      console.error("Failed to generate podcast:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle query parameter from home page search
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setInput(query);
      // Auto-generate if there's a query
      handleGenerate(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const exampleTopics = getPodcastExamples();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Podcast Creator</h1>
            <p className="text-muted-foreground">
              Transform any topic into engaging dialogues
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Input Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Enter Your Topic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., How do plants grow in space? Explain the effects of microgravity on plant root systems..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-32 rounded-xl resize-none"
              />
              <Button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !input.trim()}
                className="w-full gap-2 rounded-xl h-12"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Podcast...
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Generate Podcast
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Podcast */}
          {exchanges.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Podcast</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2 rounded-xl">
                    <Play className="h-4 w-4" />
                    Play
                  </Button>
                  <Button variant="outline" className="gap-2 rounded-xl">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {exchanges.map((exchange, i) => (
                  <Card
                    key={i}
                    className={`rounded-2xl transition-smooth ${
                      exchange.speaker === "Host"
                        ? "border-purple-500/20 bg-purple-500/5"
                        : "border-pink-500/20 bg-pink-500/5"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="mb-3">
                        <Badge
                          className={`rounded-lg ${
                            exchange.speaker === "Host"
                              ? "bg-purple-500"
                              : "bg-pink-500"
                          }`}
                        >
                          {exchange.speaker}
                        </Badge>
                      </div>
                      <p className="text-base leading-relaxed">{exchange.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Example Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleTopics.map((topic, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 rounded-xl"
                  onClick={() => setInput(topic)}
                >
                  {topic}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">How it works</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Enter your topic or question</li>
                <li>2. AI generates a natural dialogue</li>
                <li>3. Listen or download as audio</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
