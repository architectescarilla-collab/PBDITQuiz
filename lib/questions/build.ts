/**
 * Helper for authoring question banks.
 *
 * Authoring convention: the FIRST choice is always the correct one.
 * Choices are shuffled at runtime (unless `fixed` is set, e.g. True/False),
 * so never write choices like "All of the above" / "Both A and B".
 */
import type { Difficulty, Question } from "../types";

export type Entry = [question: string, choices: string[], explanation: string, fixed?: "fixed"];

export function build(idPrefix: string, difficulty: Difficulty, entries: Entry[]): Question[] {
  const short = { easy: "e", hard: "h", tricky: "t" }[difficulty];
  return entries.map(([question, choices, explanation, fixed], i) => {
    const q: Question = {
      id: `${idPrefix}-${short}-${String(i + 1).padStart(2, "0")}`,
      difficulty,
      question,
      choices,
      answer: 0,
      explanation,
    };
    if (fixed) {
      // True/False: keep "True" then "False" in that order; find which one is correct.
      const ordered = ["True", "False"];
      q.choices = ordered;
      q.answer = ordered.indexOf(choices[0]);
      q.fixedOrder = true;
    }
    return q;
  });
}

/** A question prompt followed by a code snippet, shown as a code block. */
export function code(prompt: string, src: string): string {
  return `${prompt}\n\`\`\`\n${src}\n\`\`\``;
}
