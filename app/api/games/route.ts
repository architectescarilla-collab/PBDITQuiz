import { body, handle } from "@/lib/api";
import { createGame } from "@/lib/game";
import type { DifficultyMode } from "@/lib/types";

export async function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    return createGame({
      topicId: String(b.topicId ?? ""),
      lessonId: String(b.lessonId ?? ""),
      mode: String(b.mode ?? "") as DifficultyMode,
      count: Number(b.count),
    });
  });
}
