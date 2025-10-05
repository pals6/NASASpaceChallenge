// Unified API utilities for NASA Space Biology Knowledge Base

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
