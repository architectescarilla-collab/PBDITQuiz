import { KartGame } from "@/components/games/kart/KartGame";

export const metadata = { title: "PBDIT Kart · PBDIT Quiz" };

export default function PbditKartPage() {
  return (
    <main className="mx-auto min-h-[calc(100dvh-45px)]">
      <KartGame />
    </main>
  );
}
