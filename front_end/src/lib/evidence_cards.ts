// Evidence Cards (Clean Text Only) — TypeScript version
// Ported from your FastAPI/Python logic to pure TS functions.
// Input: payload object { response, references, include_unmatched? }
// Output: { total_cards, cards: [...] }

export type Reference = {
    reference_id: string;   // "1", "2", ...
    file_path: string;      // e.g., "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10261121/"
  };
  
  export type InputPayload = {
    response: string;
    references: Reference[];
    include_unmatched?: boolean;
  };
  
  export type EvidenceSnippet = {
    text: string;
  };
  
  export type EvidenceCard = {
    paper_id: string;             // reference_id
    paper_title: string;          // derived from PMC id or path segment
    snippet_count: number;
    snippets: EvidenceSnippet[];  // cleaned text sentences only
    linkouts: { source_url: string };
  };
  
  export type EvidenceResponse = {
    total_cards: number;
    cards: EvidenceCard[];
  };
  
  // -------------------- CLEANING HELPERS --------------------
  const URL_RE = /https?:\/\/[^\s)]+/gi;
  const BRACKET_REF_RE = /\[\s*\d+(?:\s*[,–-]\s*\d+)*\s*\]/g; // [1], [2,5], [3–6]
  const PMC_RE = /\bPMC\d+\b/gi;
  // build "(<url>)" without double-escaping:
  const PARENS_URL_RE = new RegExp(`\\(\\s*${URL_RE.source}\\s*\\)`, "gi");
  const MD_HEADING_RE = /^\s{0,3}#{1,6}\s*.*$/gim;
  
  function isReferenceListLine(s: string): boolean {
    const t = s.trim();
    if (!t) return true;
    if (t.toLowerCase().startsWith("### references") || t.toLowerCase() === "references") {
      return true;
    }
    // bullet with only urls / dashes
    const noBullet = t.replace(/^[\-\*\•]\s*/, "");
    const core = noBullet.replace(URL_RE, "").replace(/-/g, " ").trim();
    return core.length === 0;
  }
  
  function cleanTextSnippet(s: string): string {
    // remove markdown headings inside the sentence (safety)
    s = s.replace(MD_HEADING_RE, "");
  
    // remove [1], [2,5], [3–6]
    s = s.replace(BRACKET_REF_RE, "");
  
    // remove parenthetical (url)
    s = s.replace(PARENS_URL_RE, "");
  
    // remove raw urls
    s = s.replace(URL_RE, "");
  
    // remove PMC tokens
    s = s.replace(PMC_RE, "");
  
    // remove lingering empty parens/brackets and extra spaces
    s = s.replace(/\(\s*\)/g, "");
    s = s.replace(/\[\s*\]/g, "");
    s = s.replace(/\s{2,}/g, " ");
  
    // strip markdown bullets and tighten spaces before punctuation
    s = s.replace(/^[\-\*\•]\s*/, "").trim();
    s = s.replace(/\s+([.,;:!?])/g, "$1");
  
    return s.trim();
  }
  
  // -------------------- EXTRACTION --------------------
  function sentenceSplit(text: string): string[] {
    const t = (text || "").split(/\s+/).join(" ").trim();
    if (!t) return [];
    // simple, robust sentence splitter
    return t.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
  }
  
  function extractSnippetsForRef(text: string, ref: Reference): string[] {
    const sentences = sentenceSplit(text);
    const pmcTokenMatch = ref.file_path.match(/(PMC\d+)/i);
    const pmcToken = pmcTokenMatch ? pmcTokenMatch[1] : null;
  
    const snips: string[] = [];
    for (const s of sentences) {
      let match = false;
  
      if (s.includes(`[${ref.reference_id}]`)) match = true;       // numeric markers
      if (!match && s.includes(ref.file_path)) match = true;       // exact URL
      if (!match && pmcToken && s.includes(pmcToken)) match = true; // PMC token
  
      if (!match) continue;
      if (isReferenceListLine(s)) continue;
  
      const cleaned = cleanTextSnippet(s);
      if (cleaned) snips.push(cleaned);
    }
  
    // de-dupe while preserving order
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of snips) {
      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    return out;
  }
  
  function titleFromUrl(url: string): string {
    let title = url.replace(/\/+$/g, "").split("/").pop() || url;
    const m = url.match(/(PMC\d+)/i);
    if (m) title = m[1].toUpperCase();
    return title;
  }
  
  function buildCard(ref: Reference, snippets: string[]): EvidenceCard {
    return {
      paper_id: ref.reference_id,
      paper_title: titleFromUrl(ref.file_path),
      snippet_count: snippets.length,
      snippets: snippets.map(text => ({ text })),
      linkouts: { source_url: ref.file_path },
    };
  }
  
  // -------------------- PUBLIC API --------------------
  export function generateEvidenceCards(payload: InputPayload): EvidenceResponse {
    const { response, references, include_unmatched = false } = payload;
  
    const cards: EvidenceCard[] = [];
    const text = response || "";
    for (const ref of references) {
      const snippets = extractSnippetsForRef(text, ref);
      if (snippets.length || include_unmatched) {
        const snips = snippets.length ? snippets : ["No direct mentions found in the text."];
        cards.push(buildCard(ref, snips));
      }
    }
    return { total_cards: cards.length, cards };
  }
  