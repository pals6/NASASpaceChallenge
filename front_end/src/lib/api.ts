// Unified API utilities for NASA Space Biology Knowledge Base

import JSZip from "jszip";

const api_url = process.env.NEXT_PUBLIC_API_URL;
const api_key = process.env.NEXT_PUBLIC_API_KEY;

// ============================================================================
// TIMELINE DATA
// ============================================================================

export interface TimelineDataPoint {
  year: number;
  count: number;
  highlight: string;
}

export const getTimelineData = (): TimelineDataPoint[] => {
  return [
    { year: 2015, count: 5, highlight: "Initial ISS Biology Studies" },
    { year: 2016, count: 8, highlight: "Plant Growth Experiments" },
    { year: 2017, count: 12, highlight: "Sleep & Circadian Research" },
    { year: 2018, count: 15, highlight: "Bone Density Studies" },
    { year: 2019, count: 18, highlight: "Microbial Behavior Analysis" },
    { year: 2020, count: 22, highlight: "COVID-19 Space Research" },
    { year: 2021, count: 25, highlight: "DNA Repair Mechanisms" },
    { year: 2022, count: 20, highlight: "Muscle Atrophy Prevention" },
    { year: 2023, count: 16, highlight: "Advanced Life Support" },
  ];
};

export const getTimelineStats = () => {
  const data = getTimelineData();
  return {
    totalYears: data.length,
    totalStudies: data.reduce((sum, d) => sum + d.count, 0),
    maxCount: Math.max(...data.map((d) => d.count)),
    minCount: Math.min(...data.map((d) => d.count)),
  };
};

// ============================================================================
// PODCAST DATA
// ============================================================================

const PODCAST_API_URL = "https://enterally-subtarsal-enola.ngrok-free.dev/";

export const generatePodcastAudio = async (topic: string): Promise<Blob> => {
  const response = await fetch(PODCAST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/wav",
      "X-API-Key": "nasa4t0rw9wNOGFZ66QVpsNq4a5IhUv1xDfhPZuG08KT3cuafzRa4bW4G9ETKU08baZQd1MJLWOJqUMlIY1dUVilybJ3pdNhWh6vu6u0Kq0wQVyPFsjeo9KSQZ6IG1jJ",
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({
      topic,
      max_words: 100,
      conversation_style: ["casual", "educative"],
      creativity: 0.7,
      podcast_name: "NASA Podcast",
      max_num_chunks: 3,
      model: "gpt-4o-mini",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate podcast audio: ${response.status} ${response.statusText}`);
  }

  return response.blob();
};

export const getPodcastExamples = (): string[] => {
  return [
    "How does radiation affect DNA in space?",
    "Why do astronauts lose bone density?",
    "Can we grow food on Mars?",
    "How do microbes behave in microgravity?",
  ];
};

// ============================================================================
// CHAT DATA
// ============================================================================

type BackendDoc = Record<string, unknown> & {
  id?: string | number;
  title?: string;
  name?: string;
  heading?: string;
  summary?: string;
  content_summary?: string;
  description?: string;
  source?: string;
  collection?: string;
  publisher?: string;
  file_path?: string;
  url?: string;
  link?: string;
};

type BackendResponse = {
  statuses?: {
    processed?: BackendDoc[];
    // queued?: BackendDoc[];
    // failed?: BackendDoc[];
    [k: string]: BackendDoc[] | undefined;
  };
};

const truncate = (s: string, max = 220) =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;

export interface DocumentResult {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  source?: string;
}

const toDocumentResult = (input: unknown, index: number): DocumentResult => {
  if (typeof input === "string") {
    return {
      id: `doc-${index}`,
      title: truncate(input),
    };
  }

  if (input && typeof input === "object") {
    const doc = input as BackendDoc;
    const rawId = doc.id ?? `doc-${index}`;
    const id = typeof rawId === "string" ? rawId : String(rawId);

    const rawTitle =
      (typeof doc.title === "string" && doc.title.trim()) ||
      (typeof doc.name === "string" && doc.name.trim()) ||
      (typeof doc.heading === "string" && doc.heading.trim()) ||
      (typeof doc.file_path === "string" && doc.file_path.trim()) ||
      undefined;

    const rawSummary =
      (typeof doc.summary === "string" && doc.summary.trim()) ||
      (typeof doc.content_summary === "string" && doc.content_summary.trim()) ||
      (typeof doc.description === "string" && doc.description.trim()) ||
      undefined;

    const rawSource =
      (typeof doc.source === "string" && doc.source.trim()) ||
      (typeof doc.collection === "string" && doc.collection.trim()) ||
      (typeof doc.publisher === "string" && doc.publisher.trim()) ||
      undefined;

    const rawLink =
      (typeof doc.url === "string" && doc.url.trim()) ||
      (typeof doc.link === "string" && doc.link.trim()) ||
      (typeof doc.file_path === "string" && doc.file_path.trim()) ||
      undefined;

    const title = rawTitle ?? `Document ${String(index + 1).padStart(2, "0")}`;
    const summary = rawSummary ? truncate(rawSummary) : undefined;
    const source = rawSource;
    const url = rawLink && /^https?:/i.test(rawLink) ? rawLink : undefined;

    return { id, title, summary, source, url };
  }

  return {
    id: `doc-${index}`,
    title: `Document ${String(index + 1).padStart(2, "0")}`,
  };
};

export const getDocuments = async (query: string): Promise<DocumentResult[]> => {
  if (!api_url) {
    console.warn("NEXT_PUBLIC_API_URL is not set; skipping document lookup.");
    return [];
  }

  try {
    const url = new URL(`${api_url}/documents`);
    if (query) url.searchParams.set("q", query);

    const headers = new Headers({
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    });
    if (api_key) headers.set("X-API-Key", api_key);

    const response = await fetch(url.toString(), { method: "GET", headers });

    if (!response.ok) {
      throw new Error(`Error fetching documents: ${response.status} ${response.statusText}`);
    }

    const data: BackendResponse = await response.json();

    const processed: unknown[] = [];
    if (Array.isArray(data.statuses?.processed)) {
      processed.push(...data.statuses.processed);
    }
    const records = data as Record<string, unknown>;
    if (Array.isArray(records.documents)) {
      processed.push(...(records.documents as BackendDoc[]));
    }
    if (Array.isArray(records.processed)) {
      processed.push(...(records.processed as BackendDoc[]));
    }

    const normalized = processed.map((doc, index) => toDocumentResult(doc, index));
    const unique = new Map<string, DocumentResult>();
    normalized.forEach((entry) => {
      if (unique.has(entry.id)) {
        unique.set(entry.id, { ...unique.get(entry.id)!, ...entry });
      } else {
        unique.set(entry.id, entry);
      }
    });
    return Array.from(unique.values());
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

type StreamReference = {
  reference_id?: string | number;
  file_path?: string;
  title?: string;
  source?: string;
};

type StreamChunk = {
  references?: StreamReference[];
  response?: string;
  error?: string;
};

export interface SendMessageOptions {
  signal?: AbortSignal;
  onToken?: (token: string) => void;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface SendMessageResult {
  message: string;
  references: DocumentResult[];
}

const referencesToDocuments = (
  refs: StreamReference[] | undefined
): DocumentResult[] => {
  if (!Array.isArray(refs)) return [];
  return refs.map((ref, index) => {
    const id = ref.reference_id
      ? String(ref.reference_id)
      : `ref-${index + 1}`;
    const url = ref.file_path && /^https?:/i.test(ref.file_path)
      ? ref.file_path
      : undefined;
    const title = ref.title ?? ref.file_path ?? `Reference ${id}`;
    const source = ref.source ?? undefined;
    return {
      id,
      title,
      url,
      source,
    };
  });
};

export const sendMessage = async (
  prompt: string,
  options: SendMessageOptions = {}
): Promise<SendMessageResult> => {
  if (!api_url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set; cannot send message");
  }

  const url = `${api_url}/query/stream`;
  const payload = {
    query: prompt,
    mode: "mix",
    only_need_context: false,
    only_need_prompt: false,
    response_type:
      "provide the content always cited with source document path. Content should include multiple paragraphs.",
    top_k: 10,
    chunk_top_k: 10,
    max_entity_tokens: 10000,
    max_relation_tokens: 10000,
    max_total_tokens: 30000,
    user_prompt: "Provide list of all source paths for retrived documents",
    enable_rerank: true,
    include_references: true,
    stream: true,
    conversation_history: Array.isArray(options.conversationHistory)
      ? options.conversationHistory
          .filter((item) => item.role === "user" && item.content.trim().length > 0)
          .map((item) => ({ role: item.role, content: item.content }))
      : [],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(api_key ? { "X-API-Key": api_key } : {}),
    },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to send message: ${response.status} ${response.statusText}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let aggregated = "";
  let references: DocumentResult[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer) as StreamChunk;
          if (chunk.references && references.length === 0) {
            references = referencesToDocuments(chunk.references);
          }
          if (chunk.response) {
            aggregated += chunk.response;
            options.onToken?.(chunk.response);
          }
        } catch (error) {
          console.error("Failed to parse final stream chunk", error);
        }
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) {
        try {
          const chunk = JSON.parse(line) as StreamChunk;
          if (chunk.references && references.length === 0) {
            references = referencesToDocuments(chunk.references);
          }
          if (chunk.response) {
            aggregated += chunk.response;
            options.onToken?.(chunk.response);
          }
          if (chunk.error) {
            throw new Error(chunk.error);
          }
        } catch (error) {
          console.error("Failed to parse stream chunk", error, line);
        }
      }
      newlineIndex = buffer.indexOf("\n");
    }
  }

  return {
    message: aggregated.trim(),
    references,
  };
};

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const getChatSuggestedPrompts = (): string[] => {
  return [
    "Summarize the latest findings on microgravity and muscle loss",
    "How do plants adapt their root systems in space?",
    "Explain why radiation shielding is crucial for crewed missions",
    "Give me a study plan to learn space biology fundamentals",
  ];
};

const cannedResponses: Record<string, string> = {
  microgravity:
    "Microgravity leads to reduced mechanical loading on muscles, triggering atrophy pathways. Countermeasures focus on resistive exercise and nutritional support to maintain muscle mass during long-duration missions.",
  plants:
    "Plants in space rely on directional light cues and airflow to guide root growth since gravity is absent. Experiments such as VEGGIE show that tailored LED spectrums and smart irrigation help roots orient and prevent waterlogging.",
  radiation:
    "Radiation shielding protects astronauts from galactic cosmic rays and solar particle events. Materials like polyethylene and water are effective absorbers, and shield design balances mass constraints with safety.",
  plan:
    "Start with NASA's Space Biology Program overview, explore ISS experiment archives, and follow with review papers on microgravity effects. Combine reading with hands-on simulations like plant growth kits or online labs for deeper understanding.",
};

const pickCannedResponse = (prompt: string) => {
  const lower = prompt.toLowerCase();
  if (lower.includes("muscle") || lower.includes("microgravity")) {
    return cannedResponses.microgravity;
  }
  if (lower.includes("plant") || lower.includes("root")) {
    return cannedResponses.plants;
  }
  if (lower.includes("radiation") || lower.includes("shield")) {
    return cannedResponses.radiation;
  }
  if (lower.includes("plan") || lower.includes("study")) {
    return cannedResponses.plan;
  }
  return "I'm synthesizing insights from recent space biology missions. Could you share more context or narrow the focus so I can provide a precise answer?";
};

export const generateChatResponse = async (
  prompt: string
): Promise<ChatMessage> => {
  try {
    const { message } = await sendMessage(prompt);
    const trimmed = message || pickCannedResponse(prompt);
    return {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("sendMessage failed, falling back to canned response", error);
    const content = pickCannedResponse(prompt);
    return {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
    };
  }
};

// ============================================================================
// COMIC DATA
// ============================================================================

export interface ComicPage {
  pageNumber: number;
  title: string;
  imageUrl: string;
}

const COMIC_API_URL = "https://enterally-subtarsal-enola.ngrok-free.dev/comic";

const toDataUrl = (value: string): string => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `data:image/png;base64,${trimmed}`;
};

export const generateComic = async (
  storyIdea: string,
  pages: 1 | 2
): Promise<ComicPage[]> => {
  const response = await fetch(COMIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": "nasa4t0rw9wNOGFZ66QVpsNq4a5IhUv1xDfhPZuG08KT3cuafzRa4bW4G9ETKU08baZQd1MJLWOJqUMlIY1dUVilybJ3pdNhWh6vu6u0Kq0wQVyPFsjeo9KSQZ6IG1jJ",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      topic: storyIdea,
      comic_title: "NASA Comic",
      max_num_chunks: 3,
      model: "gemini-2.5-flash",
      gemini_api_key: process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "",
      comic_pages: pages,
      include_dialogue: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate comic: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  let images: string[] = [];
  let titles: string[] | undefined;

  if (contentType.includes("application/json")) {
    const data = await response.json();
    if (Array.isArray(data?.images)) {
      images = data.images as string[];
    } else if (Array.isArray(data?.pages)) {
      images = (data.pages as Array<{ image?: string; image_url?: string }>).map((item) => item?.image ?? item?.image_url ?? "");
    }
    if (Array.isArray(data?.titles)) {
      titles = data.titles as string[];
    }
  } else if (/zip/i.test(contentType) || contentType.includes("application/octet-stream")) {
    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const files = Object.values(zip.files)
      .filter((file) => !file.dir && /\.(png|jpe?g|webp|gif)$/i.test(file.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    images = await Promise.all(
      files.map(async (file) => {
        const blob = await file.async("blob");
        return URL.createObjectURL(blob);
      })
    );

    console.log(`Comic ZIP contained ${images.length} image${images.length === 1 ? "" : "s"}.`);

    const metaFile = Object.values(zip.files).find((file) => /meta/i.test(file.name) && file.name.endsWith(".json"));
    if (metaFile) {
      try {
        const metaText = await metaFile.async("text");
        const metaJson = JSON.parse(metaText);
        if (Array.isArray(metaJson?.titles)) {
          titles = metaJson.titles as string[];
        }
      } catch (error) {
        console.warn("Failed to parse comic metadata from zip", error);
      }
    }
  } else {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    images = [url];
  }

  if (!images.length) {
    throw new Error("Comic API returned no images");
  }

  return images.slice(0, pages).map((image, index) => ({
    pageNumber: index + 1,
    title: titles?.[index] ?? `${storyIdea.slice(0, 42)}${storyIdea.length > 42 ? "..." : ""}`,
    imageUrl: toDataUrl(image),
  }));
};

export const getComicExamples = (): string[] => {
  return [
    "A plant's journey growing in a space station",
    "An astronaut scientist discovers a new microbe",
    "The adventure of a DNA molecule in space radiation",
    "A day in the life of bones in zero gravity",
  ];
};

// ============================================================================
// KNOWLEDGE GRAPH DATA
// ============================================================================

export interface GraphNode {
  id: string;
  type: "Study" | "Topic" | "Mission";
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export const getGraphData = (): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const nodes: GraphNode[] = [
    { id: "1", type: "Study", label: "Bone Density", x: 200, y: 150 },
    { id: "2", type: "Study", label: "Plant Growth", x: 400, y: 100 },
    { id: "3", type: "Study", label: "DNA Repair", x: 600, y: 150 },
    { id: "4", type: "Topic", label: "Gravity", x: 300, y: 250 },
    { id: "5", type: "Topic", label: "Radiation", x: 500, y: 250 },
    { id: "6", type: "Mission", label: "ISS", x: 400, y: 350 },
  ];

  const edges: GraphEdge[] = [
    { from: "1", to: "4" },
    { from: "2", to: "4" },
    { from: "3", to: "5" },
    { from: "1", to: "6" },
    { from: "2", to: "6" },
    { from: "3", to: "6" },
  ];

  return { nodes, edges };
};

export const getNodeColors = () => ({
  Study: "#3b82f6",
  Topic: "#eab308",
  Mission: "#ef4444",
});

export const getNodeDescription = (type: GraphNode["type"]): string => {
  switch (type) {
    case "Study":
      return "Research study exploring space biology phenomena.";
    case "Topic":
      return "Key research topic connecting multiple studies.";
    case "Mission":
      return "Space mission conducting biology research.";
  }
};

// ============================================================================
// FLASH CARDS DATA
// ============================================================================

export interface FlashCard {
  id: number;
  category: string;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const getFlashCards = (): FlashCard[] => {
  return [
    {
      id: 1,
      category: "Bone Health",
      question: "How much bone density do astronauts lose per month in space?",
      answer:
        "Astronauts lose about 1-2% of bone mass per month in space due to the lack of gravity. This is similar to what older adults experience in a year on Earth!",
      difficulty: "Medium",
    },
    {
      id: 2,
      category: "Plant Biology",
      question: "Why do plants grow differently in space?",
      answer:
        "Without gravity, plants can't tell which way is 'up'. They rely on special lights to guide their growth direction. This is called phototropism!",
      difficulty: "Easy",
    },
    {
      id: 3,
      category: "Microbiology",
      question: "How do microbes behave differently in microgravity?",
      answer:
        "Microbes grow faster and can become more resistant to antibiotics in space. They also form biofilms more quickly, which helps them survive harsh conditions.",
      difficulty: "Hard",
    },
    {
      id: 4,
      category: "Sleep Science",
      question: "Why is it hard to sleep on the ISS?",
      answer:
        "The ISS orbits Earth every 90 minutes, so astronauts see 16 sunrises and sunsets per day! This disrupts their natural sleep-wake cycle (circadian rhythm).",
      difficulty: "Easy",
    },
    {
      id: 5,
      category: "DNA & Genetics",
      question: "How does space radiation affect DNA?",
      answer:
        "Space radiation can damage DNA by breaking the strands. Luckily, our cells have repair mechanisms, but they work about 25% slower in space.",
      difficulty: "Hard",
    },
    {
      id: 6,
      category: "Muscle Health",
      question: "Why do astronauts need to exercise 2 hours daily?",
      answer:
        "Without gravity, muscles don't work as hard. Daily exercise prevents muscle loss (atrophy) and helps maintain about 85% of muscle mass during missions.",
      difficulty: "Medium",
    },
  ];
};

export const getDifficultyColors = () => ({
  Easy: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  Hard: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
});

// ============================================================================
// FUN FACTS DATA
// ============================================================================

export const getFunFacts = (): string[] => {
  return [
    "Astronauts can get up to 2 inches taller in space!",
    "Plants grow differently in microgravity, with roots growing in all directions.",
    "Space radiation is 10 times stronger than on Earth.",
    "Bones lose 1-2% of mass per month in space without countermeasures.",
    "Microbes behave differently in space and can become more resistant.",
    "Sleep patterns change in space due to 16 sunrises per day on the ISS!",
  ];
};
