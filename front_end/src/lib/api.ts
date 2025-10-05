// Unified API utilities for NASA Space Biology Knowledge Base

const api_url = process.env.NEXT_PUBLIC_API_URL;
const api_key = process.env.NEXT_PUBLIC_API_KEY;

// ============================================================================
// TIMELINE DATA
// ============================================================================
// src/lib/api.ts
export type TimelineItem = {
  title: string;
  year: number;
  date: string;
  mission: string;
  impact: string;
  summary: string;
  link: string;
};

export const CURATED_TOPICS: readonly string[] = [
  "Radiation",
  "Bone Health",
  "Muscle & Exercise",
  "Immune System",
  "Plants & Food",
  "Microbes & Biofilms",
  "Sleep & Circadian",
  "Vision & Eye",
  "Cardiovascular",
  "Oxidative Stress",
] as const;

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

/** Canonical queries for curated topics */
const TOPIC_QUERY: Record<string, string> = {
  Microgravity: "microgravity AND spaceflight",
  Radiation: "(space radiation OR ionizing radiation OR DNA repair) AND (ISS OR spaceflight)",
  "Bone Health": "(bone OR skeletal OR osteoporosis OR ARED) AND (microgravity OR spaceflight)",
  "Muscle & Exercise": "(muscle atrophy OR exercise countermeasures OR ARED) AND (ISS OR spaceflight)",
  "Immune System": "(immune OR inflammation OR cytokines) AND (spaceflight OR ISS)",
  "Plants & Food": "(plants OR Arabidopsis OR crop OR food) AND (microgravity OR space station)",
  "Microbes & Biofilms": "(microbe OR bacteria OR biofilm OR antibiotic resistance) AND (microgravity OR ISS)",
  "Sleep & Circadian": "(sleep OR circadian OR lighting) AND (ISS OR spaceflight)",
  "Vision & Eye": "(vision OR ocular OR SANS OR ophthalmic) AND (spaceflight OR ISS)",
  Cardiovascular: "(cardio OR cardiovascular OR heart OR vascular) AND (spaceflight OR microgravity)",
  "Oxidative Stress": "(oxidative stress OR ROS OR antioxidant) AND (spaceflight OR microgravity)",
};

/** Heuristic mapping: if a non-curated topic is ever passed, map to a curated one */
export function canonicalizeTopic(input: string): string {
  const s = input.toLowerCase();
  const M = (k: string) => k; // tiny helper to keep lines short

  if (TOPIC_QUERY[input]) return input;
  if (/\bmicrogravity|spaceflight|iss\b/.test(s)) return M("Microgravity");
  if (/\bradiation|ionizing|dna repair|cosmic|solar\b/.test(s)) return M("Radiation");
  if (/\bbone|osteoporosis|ared\b/.test(s)) return M("Bone Health");
  if (/\bmuscle|exercise|ared\b/.test(s)) return M("Muscle & Exercise");
  if (/\bimmune|cytokine|inflammation\b/.test(s)) return M("Immune System");
  if (/\bplant|arabidopsis|crop|food\b/.test(s)) return M("Plants & Food");
  if (/\bmicrobe|bacteria|biofilm|antibiotic\b/.test(s)) return M("Microbes & Biofilms");
  if (/\bsleep|circadian|lighting\b/.test(s)) return M("Sleep & Circadian");
  if (/\bvision|ocular|sans|eye\b/.test(s)) return M("Vision & Eye");
  if (/\bcardio|heart|vascular\b/.test(s)) return M("Cardiovascular");
  if (/\boxidative|ros|antioxidant\b/.test(s)) return M("Oxidative Stress");

  // default to Microgravity (safest general topic)
  return "Microgravity";
}

/** CURATED ONLY: always return our set, regardless of server labels */
export async function fetchPopularTopics(limit = 20): Promise<string[]> {
  return [...CURATED_TOPICS].slice(0, limit);
}

/** If you want the “extra” labels to display in a second group later */
export async function fetchExtraTopics(limit = 30): Promise<string[]> {
  try {
    const res = await fetch(`/api/popular?limit=${limit}`, {
      headers: { "ngrok-skip-browser-warning": "true", "X-API-Key": API_KEY },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const server: string[] = Array.isArray(data) ? data.map(String).filter(Boolean) : [];

    const curatedSet = new Set(CURATED_TOPICS.map((t) => t.toLowerCase()));
    const uniq = new Set<string>();
    const extras: string[] = [];
    for (const t of server) {
      const k = t.toLowerCase();
      if (!curatedSet.has(k) && !uniq.has(k)) {
        extras.push(t);
        uniq.add(k);
      }
    }
    return extras;
  } catch {
    return [];
  }
}

/** Timeline query via server proxy; robust normalization */
export async function fetchTimeline(topic: string): Promise<TimelineItem[]> {
  const canonical = canonicalizeTopic(topic);
  const focus = TOPIC_QUERY[canonical] || canonical;

  const body = {
    query: `Create a student-friendly timeline from NASA space biology publications about: ${focus}.`,
    mode: "mix",
    only_need_context: false,
    only_need_prompt: false,
    response_type: "multiple paragraphs",
    top_k: 20,
    chunk_top_k: 20,
    max_entity_tokens: 5000,
    max_relation_tokens: 3000,
    max_total_tokens: 12000,
    enable_rerank: true,
    include_references: true,
    stream: false,
    user_prompt:
`Return a STRICT JSON array (no prose) where each element is:
{"title":string,"year":number,"date":string,"mission":string,"impact":string,"summary":string,"link":string}.
Include 6–10 items across years. Prefer Results/Conclusions. If full date unknown use YYYY-01-01.`,
  };

  const res = await fetch("/api/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`timeline request failed: ${res.status}`);

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    const txt = await res.text();
    payload = { response: txt };
  }

  if (Array.isArray(payload)) return normalizeItems(payload);

  if (
    payload &&
    typeof payload === "object" &&
    "response" in payload &&
    typeof (payload as any).response === "string"
  ) {
    const raw = (payload as any).response as string;
    const clean = raw.replace(/^```json/i, "").replace(/```$/i, "").trim();
    try {
      const arr = JSON.parse(clean);
      return normalizeItems(arr);
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeItems(arr: any[]): TimelineItem[] {
  return (arr || []).map((d) => {
    const y = Number(d?.year);
    const safeYear = Number.isFinite(y) && y > 0 ? y : 2000;
    return {
      title: String(d?.title ?? ""),
      year: safeYear,
      date: typeof d?.date === "string" && d.date ? d.date : `${safeYear}-01-01`,
      mission: String(d?.mission ?? ""),
      impact: String(d?.impact ?? ""),
      summary: String(d?.summary ?? ""),
      link: String(d?.link ?? ""),
    };
  });
}





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
    const statuses = data.statuses;
    if (statuses && Array.isArray(statuses.processed)) {
  processed.push(...statuses.processed);
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
}

export const generateComic = async (
  storyIdea: string,
  pages: 1 | 2
): Promise<ComicPage[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2500));

  return Array.from({ length: pages }, (_, i) => ({
    pageNumber: i + 1,
    title: `${storyIdea.slice(0, 30)}...`,
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
