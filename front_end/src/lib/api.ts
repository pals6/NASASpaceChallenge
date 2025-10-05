// Unified API utilities for NASA Space Biology Knowledge Base

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

export interface PodcastExchange {
  speaker: "Host" | "Guest";
  text: string;
}

export interface PodcastCollectionItem {
  id: string;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  accent?: string;
}

export interface PodcastCollection {
  id: string;
  title: string;
  description?: string;
  layout: "grid" | "row";
  itemShape: "square" | "circle" | "pill";
  items: PodcastCollectionItem[];
}

export const generatePodcast = async (input: string): Promise<PodcastExchange[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return [
    {
      speaker: "Host",
      text: "Welcome! Today we're exploring a fascinating topic in space biology. Can you tell us what makes this research so important?",
    },
    {
      speaker: "Guest",
      text: "Thanks for having me! This research helps us understand how living organisms adapt to the unique conditions of space, which is crucial for long-duration missions and has applications here on Earth too.",
    },
    {
      speaker: "Host",
      text: "That's incredible! What's the most surprising discovery you've encountered?",
    },
    {
      speaker: "Guest",
      text: "One of the most surprising findings is how quickly biological systems can adapt. It's given us new insights that we never expected and opened up entirely new research directions.",
    },
  ];
};

export const getPodcastExamples = (): string[] => {
  return [
    "How does radiation affect DNA in space?",
    "Why do astronauts lose bone density?",
    "Can we grow food on Mars?",
    "How do microbes behave in microgravity?",
  ];
};

export const getPodcastCollections = (): PodcastCollection[] => {
  return [
    {
      id: "popular-spacecasts",
      title: "Popular albums and singles",
      description: "Fan-favourite dialogues from the cosmic archive",
      layout: "grid",
      itemShape: "square",
      items: [
        {
          id: "aurora",
          title: "Aurora Overload",
          subtitle: "Dr. Mira Chen",
          gradientFrom: "#5ee7df",
          gradientTo: "#b490ca",
        },
        {
          id: "gravity-gardens",
          title: "Gravity Gardens",
          subtitle: "Lt. Javier Sol",
          gradientFrom: "#f6d365",
          gradientTo: "#fda085",
        },
        {
          id: "deep-sleep",
          title: "Deep Sleep Protocols",
          subtitle: "Dr. Aleena Rao",
          gradientFrom: "#74ebd5",
          gradientTo: "#acb6e5",
        },
        {
          id: "cosmic-echoes",
          title: "Cosmic Echoes",
          subtitle: "Prof. Malik Idris",
          gradientFrom: "#c471f5",
          gradientTo: "#fa71cd",
        },
        {
          id: "stellar-harvest",
          title: "Stellar Harvest",
          subtitle: "Commander Li Na",
          gradientFrom: "#f093fb",
          gradientTo: "#f5576c",
        },
        {
          id: "tidal-labs",
          title: "Tidal Labs",
          subtitle: "Dr. Ren Ito",
          gradientFrom: "#fce38a",
          gradientTo: "#f38181",
        },
        {
          id: "neural-nights",
          title: "Neural Nights",
          subtitle: "Dr. Saanvi Patel",
          gradientFrom: "#fddb92",
          gradientTo: "#d1fdff",
        },
        {
          id: "astro-terrace",
          title: "Astro Terrace",
          subtitle: "Zara Quinn",
          gradientFrom: "#f6d365",
          gradientTo: "#fda085",
        },
      ],
    },
    {
      id: "editors-picks",
      title: "Editor's pick",
      description: "Hand-curated deep dives for curious minds",
      layout: "grid",
      itemShape: "square",
      items: [
        {
          id: "suit-up",
          title: "Suit Up for Science",
          subtitle: "Helena Park",
          gradientFrom: "#43e97b",
          gradientTo: "#38f9d7",
        },
        {
          id: "lunar-legends",
          title: "Lunar Legends",
          subtitle: "Capt. Omar Reyes",
          gradientFrom: "#30cfd0",
          gradientTo: "#330867",
        },
        {
          id: "bioforge",
          title: "Bioforge Dispatch",
          subtitle: "Dr. Ina Kovac",
          gradientFrom: "#f7797d",
          gradientTo: "#FBD786",
        },
        {
          id: "orbitals",
          title: "Orbital Originals",
          subtitle: "Tycho James",
          gradientFrom: "#12c2e9",
          gradientTo: "#c471ed",
        },
        {
          id: "celestial-cafe",
          title: "Celestial Café",
          subtitle: "Chef Lina Calder",
          gradientFrom: "#ff9a9e",
          gradientTo: "#fad0c4",
        },
        {
          id: "stellar-sleep",
          title: "Stellar Sleep Lab",
          subtitle: "Dr. Hugo Finch",
          gradientFrom: "#a18cd1",
          gradientTo: "#fbc2eb",
        },
      ],
    },
    {
      id: "popular-artists",
      title: "Popular hosts",
      description: "Voices guiding the frontier of space biology",
      layout: "row",
      itemShape: "circle",
      items: [
        {
          id: "arjun-singh",
          title: "Arjun Singh",
          subtitle: "Astrobiologist",
          gradientFrom: "#8EC5FC",
          gradientTo: "#E0C3FC",
        },
        {
          id: "maya-ruiz",
          title: "Maya Ruiz",
          subtitle: "Systems Engineer",
          gradientFrom: "#ffecd2",
          gradientTo: "#fcb69f",
        },
        {
          id: "dr-zhou",
          title: "Dr. Wei Zhou",
          subtitle: "Microgravity Researcher",
          gradientFrom: "#f8ffae",
          gradientTo: "#43c6ac",
        },
        {
          id: "ananya-khan",
          title: "Ananya Khan",
          subtitle: "Mission Commander",
          gradientFrom: "#a3bded",
          gradientTo: "#6991c7",
        },
        {
          id: "ravi-iyer",
          title: "Ravi Iyer",
          subtitle: "Flight Surgeon",
          gradientFrom: "#faffd1",
          gradientTo: "#a1ffce",
        },
        {
          id: "naomi-cole",
          title: "Naomi Cole",
          subtitle: "Biochemist",
          gradientFrom: "#fee140",
          gradientTo: "#fa709a",
        },
      ],
    },
    {
      id: "popular-radio",
      title: "Popular radio",
      description: "Continuous mission control streams",
      layout: "row",
      itemShape: "pill",
      items: [
        {
          id: "orbit-ops",
          title: "Orbit Ops Radio",
          subtitle: "Live telemetry & updates",
          gradientFrom: "#ffe985",
          gradientTo: "#fa742b",
          accent: "#2c2c54",
        },
        {
          id: "biosphere",
          title: "Biosphere Broadcast",
          subtitle: "Hab module soundscapes",
          gradientFrom: "#acb6e5",
          gradientTo: "#86fde8",
          accent: "#2d3436",
        },
        {
          id: "luna-net",
          title: "Luna Net",
          subtitle: "Moon base comms",
          gradientFrom: "#cfd9df",
          gradientTo: "#e2ebf0",
          accent: "#1e272e",
        },
        {
          id: "solwave",
          title: "SolWave",
          subtitle: "Solar weather alerts",
          gradientFrom: "#ffdde1",
          gradientTo: "#ee9ca7",
          accent: "#2c3a47",
        },
        {
          id: "stellarnight",
          title: "Stellar Night",
          subtitle: "Ambient observation decks",
          gradientFrom: "#f6f0c4",
          gradientTo: "#d99ec9",
          accent: "#1e272e",
        },
      ],
    },
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
