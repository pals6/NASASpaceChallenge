"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Timer,
  Zap,
  History,
} from "lucide-react";
import {
  ChatMessage,
  DocumentResult,
  sendMessage,
  getChatSuggestedPrompts,
  getDocuments,
} from "@/lib/api";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Hi there! I'm your space biology research guide. Ask me about experiments, mission history, or how to turn findings into actionable insights.",
  timestamp: new Date().toISOString(),
};

export default function ChatPage() {
  const { chatHistory, addToChatHistory } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const publicationsRef = useRef<HTMLDivElement | null>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  const suggestedPrompts = useMemo(() => getChatSuggestedPrompts(), []);

  useEffect(() => {
    const loadInitialDocuments = async () => {
      setIsLoadingDocuments(true);
      try {
        const initialDocs = await getDocuments(""); // or some default query
        setDocuments(initialDocs);
      } catch (error) {
        console.error("Error fetching initial documents:", error);
        setDocuments([]);
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    loadInitialDocuments();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  useEffect(() => {
    if (documents.length === 0) return;
    publicationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [documents]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `${now}-user`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    const assistantMessageId = `${now}-assistant`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setInput("");
    addToChatHistory(trimmed);
    setIsThinking(true);
    setIsLoadingDocuments(true);
    setDocuments([]);

    const controller = new AbortController();
    streamControllerRef.current?.abort();
    streamControllerRef.current = controller;

    let streamedContent = "";

    try {
      const result = await sendMessage(trimmed, {
        signal: controller.signal,
        onToken: (token) => {
          streamedContent += token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: streamedContent }
                : msg
            )
          );
        },
      });

      const finalContent = result.message || streamedContent;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: finalContent } : msg
        )
      );

      if (result.references.length > 0) {
        setDocuments(result.references.slice(0, 8));
      } else {
        const fetchedDocuments = await getDocuments(trimmed);
        setDocuments(fetchedDocuments.slice(0, 8));
      }
    } catch (error) {
      console.error("Failed to send chat message", error);
      const fallbackContent =
        streamedContent.trim() ||
        "I ran into an issue while preparing that answer. Please try asking again or adjust the question.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: fallbackContent } : msg
        )
      );
    } finally {
      streamControllerRef.current = null;
      setIsThinking(false);
      setIsLoadingDocuments(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#050d18] via-[#030915] to-[#02040a] p-6">
      <div className="mx-auto flex max-w-8xl flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-white/80 shadow-lg backdrop-blur">
              <MessageCircle className="h-5 w-5" />
              Chat Lab
            </div>
            <div className="flex flex-col gap-3 text-white">
              <h1 className="text-3xl font-bold md:text-4xl">Mission Control Chat</h1>
              <p className="max-w-2xl text-sm text-white/70">
                Collaborate with the AI research specialist to unpack studies, build narratives, and connect insights across space biology missions.
              </p>
            </div>
          </header>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-primary" />
                Live Session
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div ref={scrollRef} className="h-[460px] overflow-y-auto p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "assistant"
                          ? "justify-start"
                          : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xl rounded-3xl px-4 py-3 text-sm shadow-lg transition-all",
                          message.role === "assistant"
                            ? "bg-white/10 text-white/90 backdrop-blur"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        <p className="whitespace-pre-line leading-relaxed">
                          {message.content}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/50">
                          <Timer className="h-3 w-3" />
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3 rounded-full bg-white/10 px-3 py-2 text-xs text-white/70">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Synthesizing response...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/5 bg-black/20 p-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about space biology missions, experiments, or insights..."
                    className="min-h-[110px] resize-none border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Press Enter to send, Shift + Enter for a new line
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={!input.trim() || isThinking}
                      className="gap-2 rounded-xl bg-white text-primary hover:bg-white/90"
                    >
                      {isThinking ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          Thinking
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-[520px] space-y-6 text-white">
          <div ref={publicationsRef}>
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base text-white/90">
                  <span>Indexed Publications</span>
                  {documents.length > 0 && (
                    <Badge variant="secondary" className="rounded-md bg-white/20 text-white">
                      {documents.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Retrieving mission documents...
                  </div>
                ) : documents.length > 0 ? (
                  <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                    {documents.map((doc, index) => {
                      const key = doc.id ?? `doc-${index}`;
                      const hasUrl = Boolean(doc.url);
                      const title = doc.title ?? doc.summary ?? doc.url ?? `Publication ${String(index + 1).padStart(2, "0")}`;
                      const summary = doc.summary && doc.summary !== doc.title ? doc.summary : null;
                      const sourceLabel = doc.source ?? "Indexed publication";
                      const content = (
                        <>
                          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                            <Badge variant="secondary" className="rounded-md bg-white/20 text-white">
                              {String(index + 1).padStart(2, "0")}
                            </Badge>
                            {sourceLabel}
                          </div>
                          <p className="leading-relaxed text-white/90">{title}</p>
                          {summary ? (
                            <p className="mt-2 text-xs text-white/60">{summary}</p>
                          ) : null}
                        </>
                      );

                      return hasUrl ? (
                        <a
                          key={key}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 transition hover:border-white/40 hover:bg-white/10"
                        >
                          {content}
                        </a>
                      ) : (
                        <div
                          key={key}
                          className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/80"
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-white/60">
                    Ask a question to surface mission briefs and indexed publications tied to your query.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
