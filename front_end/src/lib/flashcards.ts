import OpenAI from "openai";

export type Flashcard = {
  id: number;
  category: string;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

// You can feed *any* JSON structure into this (e.g. NASA evidence card JSON)
export async function createFlashcardsFromJson(
  jsonInput: object,
  topic: string,
  count: number = 5
): Promise<Flashcard[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const userPrompt = `
You are an educational AI generating concise flashcards about the topic: ${topic}.
You are given a JSON dataset below that summarizes research or facts.

Generate exactly ${count} flashcards, each with:
- id (1..N)
- category (short label derived from the JSON content)
- question (short quiz-style)
- answer (1–3 sentence factual answer)
- difficulty (Easy, Medium, or Hard)

Respond ONLY as valid JSON array of flashcards.
Here is the JSON data:
${JSON.stringify(jsonInput).slice(0, 6000)}  // truncated if huge
`;

  const resp = await client.responses.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert science educator converting structured data into clear study flashcards."
      },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "flashcard_array",
        schema: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "category", "question", "answer", "difficulty"],
            properties: {
              id: { type: "integer" },
              category: { type: "string" },
              question: { type: "string" },
              answer: { type: "string" },
              difficulty: {
                type: "string",
                enum: ["Easy", "Medium", "Hard"]
              }
            }
          }
        }
      }
    }
  });

  // Extract structured JSON
  const text =
    (resp as any).output_text ||
    (resp as any).output?.[0]?.content?.[0]?.text ||
    "";
  const parsed = JSON.parse(text);
  return parsed as Flashcard[];
}