"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuizSetup } from "@/components/QuizSetup";
import { Header } from "@/components/ui";
import { postJSON, writeLocal } from "@/components/useGame";

export default function HostSetupPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto min-h-screen max-w-5xl pb-16">
      <Header />
      <div className="px-4 sm:px-6">
        <h1 className="mb-6 text-3xl font-black">Host a live game</h1>
        {error && <p className="mb-4 rounded-lg bg-bad px-4 py-3 font-bold">{error}</p>}
        <QuizSetup
          submitLabel="Create game"
          busy={busy}
          onSubmit={async ({ topic, lesson, mode, count }) => {
            setBusy(true);
            setError(null);
            try {
              const { pin, hostKey } = await postJSON<{ pin: string; hostKey: string }>("/api/games", {
                topicId: topic.id,
                lessonId: lesson.id,
                mode,
                count,
              });
              writeLocal(`host:${pin}`, hostKey);
              router.push(`/host/${pin}`);
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        />
      </div>
    </main>
  );
}
