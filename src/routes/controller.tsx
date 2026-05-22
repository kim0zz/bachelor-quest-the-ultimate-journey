import { createFileRoute } from "@tanstack/react-router";
import { GameProvider } from "@/state/gameStore";
import { ControllerView } from "@/components/ControllerView";

export const Route = createFileRoute("/controller")({
  head: () => ({
    meta: [
      { title: "Controller — Bachelor Quest" },
      { name: "description", content: "Kontroler dla Pana Młodego." },
    ],
  }),
  component: () => (
    <GameProvider>
      <ControllerView />
    </GameProvider>
  ),
});
