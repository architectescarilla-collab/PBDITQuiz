// Sanity checks for question banks. Run: npm run validate-bank
import { introToNetworksQuestions } from "../lib/questions/network-fundamentals/lesson-1-intro-to-networks.ts";
import { introToPythonQuestions } from "../lib/questions/programming-fundamentals/lesson-1-2-intro-to-python.ts";
import { loopsAndCollectionsQuestions } from "../lib/questions/programming-fundamentals/lesson-2b-3b-loops-and-collections.ts";
import { osiLayersQuestions } from "../lib/questions/network-fundamentals/lesson-2-osi-layers.ts";

const banks = {
  "Network Fundamentals / Lesson 1 (Intro to Networks)": introToNetworksQuestions,
  "Network Fundamentals / Lesson 2 (OSI)": osiLayersQuestions,
  "Programming Fundamentals / Lessons 1–2 (Intro to Python)": introToPythonQuestions,
  "Programming Fundamentals / Lessons 2b–3b (Loops & Collections)": loopsAndCollectionsQuestions,
};
let failed = false;

for (const [name, bank] of Object.entries(banks)) {
  const ids = new Set<string>();
  const texts = new Set<string>();
  const counts: Record<string, number> = {};
  for (const q of bank) {
    const err = (m: string) => { failed = true; console.error(`✗ ${q.id}: ${m}`); };
    if (ids.has(q.id)) err("duplicate id");
    ids.add(q.id);
    const t = q.question.trim().toLowerCase();
    if (texts.has(t)) err("duplicate question text");
    texts.add(t);
    if (q.choices.length < 2 || q.choices.length > 4) err(`has ${q.choices.length} choices`);
    if (new Set(q.choices).size !== q.choices.length) err("duplicate choices");
    if (!(q.answer >= 0 && q.answer < q.choices.length)) err("answer index out of range");
    if (!q.explanation) err("missing explanation");
    counts[q.difficulty] = (counts[q.difficulty] ?? 0) + 1;
  }
  console.log(`${name}: ${bank.length} questions`, counts);
}
if (failed) process.exit(1);
console.log("✓ all banks valid");
