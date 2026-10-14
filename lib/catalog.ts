import type { Lesson, Topic } from "./types";
import { osiLayersQuestions } from "./questions/network-fundamentals/lesson-2-osi-layers";

export const TOPICS: Topic[] = [
  {
    id: "network-fundamentals",
    title: "Network Fundamentals",
    description: "How computers talk to each other — models, layers, addressing.",
    status: "available",
    lessons: [
      {
        id: "lesson-1-intro-to-networks",
        title: "Lesson 1",
        subtitle: "Introduction to Networks",
        status: "coming-soon",
      },
      {
        id: "lesson-2-osi-layers",
        title: "Lesson 2",
        subtitle: "Journey Through the Layers of the OSI",
        status: "available",
        questions: osiLayersQuestions,
      },
    ],
  },
  {
    id: "programming-fundamentals",
    title: "Programming Fundamentals",
    description: "Logic, variables, control flow and problem solving.",
    status: "coming-soon",
    lessons: [],
  },
  {
    id: "information-management",
    title: "Information Management",
    description: "Data, databases and how organizations manage information.",
    status: "coming-soon",
    lessons: [],
  },
];

export function findLesson(topicId: string, lessonId: string): { topic: Topic; lesson: Lesson } | null {
  const topic = TOPICS.find((t) => t.id === topicId);
  const lesson = topic?.lessons.find((l) => l.id === lessonId);
  if (!topic || !lesson || topic.status !== "available" || lesson.status !== "available") return null;
  return { topic, lesson };
}
