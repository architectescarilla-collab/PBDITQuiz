import type { Lesson, Topic } from "./types";
import { introToNetworksQuestions } from "./questions/network-fundamentals/lesson-1-intro-to-networks";
import { osiLayersQuestions } from "./questions/network-fundamentals/lesson-2-osi-layers";
import { introToPythonQuestions } from "./questions/programming-fundamentals/lesson-1-2-intro-to-python";
import { loopsAndCollectionsQuestions } from "./questions/programming-fundamentals/lesson-2b-3b-loops-and-collections";
import { ooadLesson4Questions } from "./questions/ooad/lesson-4-ooad-for-beginners";
import { ooadLesson4Flashcards } from "./questions/ooad/lesson-4-flashcards";

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
        status: "available",
        questions: introToNetworksQuestions,
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
    description: "Python basics, loops and collections — with real code to read.",
    status: "available",
    lessons: [
      {
        id: "lesson-1-2-intro-to-python",
        title: "Lessons 1–2",
        subtitle: "Introduction to Python: Basic Concepts and Structures",
        status: "available",
        questions: introToPythonQuestions,
      },
      {
        id: "lesson-2b-3b-loops-and-collections",
        title: "Lessons 2b–3b",
        subtitle: "Loops, Lists & Tuples, Sets & Dictionaries",
        status: "available",
        questions: loopsAndCollectionsQuestions,
      },
    ],
  },
  {
    id: "ooad",
    title: "Object-Oriented Analysis and Design",
    description: "Situation-based questions on objects, use cases, UML and design patterns.",
    status: "available",
    lessons: [
      { id: "lesson-1", title: "Lesson 1", subtitle: "Topic to be announced", status: "coming-soon" },
      { id: "lesson-2", title: "Lesson 2", subtitle: "Topic to be announced", status: "coming-soon" },
      { id: "lesson-3", title: "Lesson 3", subtitle: "Topic to be announced", status: "coming-soon" },
      {
        id: "lesson-4-ooad-for-beginners",
        title: "Lesson 4",
        subtitle: "OOAD for Beginners: Objects, Use Cases, UML Diagrams & Design Patterns",
        status: "available",
        questions: ooadLesson4Questions,
        flashcards: ooadLesson4Flashcards,
      },
    ],
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
