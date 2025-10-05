// Core types for NASA Space Biology Knowledge Base

export type Category = "Humans" | "Plants" | "Animals" | "Microbes" | "Cells";

export type Topic =
  | "Radiation"
  | "Gravity"
  | "Sleep"
  | "Food"
  | "Health"
  | "Growth";

export type ImpactBadge =
  | "astronaut-health"
  | "space-farming"
  | "dna-gene"
  | "radiation-protection"
  | "osteoporosis"
  | "habitat-safety";

export interface Study {
  id: string;
  title: string;
  category: Category;
  mission: string;
  year: number;
  summaryPlain: string;
  highlights: string[];
  whyItMatters: string;
  topics: Topic[];
  impactBadges: ImpactBadge[];
  links: {
    doi?: string;
    url?: string;
  };
}