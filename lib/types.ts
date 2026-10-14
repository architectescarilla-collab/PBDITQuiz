export type Difficulty = "easy" | "hard" | "tricky";

/** "full" = an Easy → Hard → Tricky progression in one quiz. */
export type DifficultyMode = Difficulty | "full";

export interface Question {
  id: string;
  difficulty: Difficulty;
  question: string;
  /** 2–4 choices. The first entry in `choices` is NOT necessarily the answer. */
  choices: string[];
  /** Index into `choices` of the correct answer. */
  answer: number;
  explanation: string;
  /** Keep choices in authored order (e.g. True/False). */
  fixedOrder?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  status: "available" | "coming-soon";
  questions?: Question[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  status: "available" | "coming-soon";
  lessons: Lesson[];
}

/** A question as delivered to a quiz, with its choices already shuffled. */
export interface PreparedQuestion {
  id: string;
  difficulty: Difficulty;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  timeLimit: number; // seconds
}
