import { createFileRoute } from "@tanstack/react-router";
import { GameProvider } from "@/state/gameStore";
import { AdminPanel } from "@/components/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Bachelor Quest" },
      { name: "description", content: "Panel operatora gry." },
    ],
  }),
  component: () => (
    <GameProvider>
      <AdminPanel />
    </GameProvider>
  ),
});
