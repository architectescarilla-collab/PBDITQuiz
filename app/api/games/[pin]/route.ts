import { handle, isPin } from "@/lib/api";
import { GameError, getState } from "@/lib/game";

export async function GET(req: Request, ctx: { params: Promise<{ pin: string }> }) {
  return handle(async () => {
    const { pin } = await ctx.params;
    if (!isPin(pin)) throw new GameError("Game not found. Check the PIN.", 404);
    const url = new URL(req.url);
    return getState(pin, {
      playerId: url.searchParams.get("playerId"),
      hostKey: req.headers.get("x-host-key"),
    });
  });
}
