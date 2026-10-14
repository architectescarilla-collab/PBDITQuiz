import { body, handle, isPin } from "@/lib/api";
import { GameError, submitAnswer } from "@/lib/game";

export async function POST(req: Request, ctx: { params: Promise<{ pin: string }> }) {
  return handle(async () => {
    const { pin } = await ctx.params;
    if (!isPin(pin)) throw new GameError("Game not found. Check the PIN.", 404);
    const b = await body(req);
    return submitAnswer(pin, String(b.playerId ?? ""), Number(b.index), Number(b.choice));
  });
}
