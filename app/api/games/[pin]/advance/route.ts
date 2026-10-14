import { body, handle, isPin } from "@/lib/api";
import { advance, GameError, type Phase } from "@/lib/game";

export async function POST(req: Request, ctx: { params: Promise<{ pin: string }> }) {
  return handle(async () => {
    const { pin } = await ctx.params;
    if (!isPin(pin)) throw new GameError("Game not found. Check the PIN.", 404);
    const b = await body(req);
    await advance(pin, req.headers.get("x-host-key") ?? "", {
      phase: String(b.phase ?? "") as Phase,
      index: Number(b.index),
    });
    return { ok: true };
  });
}
