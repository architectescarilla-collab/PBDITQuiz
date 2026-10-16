import Link from "next/link";
import { FlappyBoji } from "@/components/games/FlappyBoji";
import { Header } from "@/components/ui";

export const metadata = { title: "Flappy Boji · PBDIT Quiz" };

export default function FlappyBojiPage() {
  return (
    <main className="mx-auto max-w-5xl pb-6">
      <Header
        right={
          <Link href="/games" className="text-sm font-bold underline">
            All games
          </Link>
        }
      />
      <div className="px-2 sm:px-6">
        <FlappyBoji />
      </div>
    </main>
  );
}
