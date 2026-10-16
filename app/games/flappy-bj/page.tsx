import Link from "next/link";
import { FlappyBJ } from "@/components/games/FlappyBJ";
import { Header } from "@/components/ui";

export const metadata = { title: "Flappy BJ · PBDIT Quiz" };

export default function FlappyBJPage() {
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
        <FlappyBJ />
      </div>
    </main>
  );
}
