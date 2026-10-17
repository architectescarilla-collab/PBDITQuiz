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
  /** If set, wordy questions (30+ words incl. choices) get this many seconds instead of the usual limit. */
  wordyTime?: number;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  status: "available" | "coming-soon";
  questions?: Question[];
  /** Optional key-terms deck for Flashcards (term → meaning). */
  flashcards?: Flashcard[];
}

/** A Quizlet-style term card. */
export interface Flashcard {
  id: string;
  /** Section of the lesson, shown as a tag on the card. */
  group: string;
  front: string;
  back: string;
  /** Example or extra note shown under the meaning. */
  detail?: string;
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
