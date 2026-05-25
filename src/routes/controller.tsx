import { createFileRoute } from "@tanstack/react-router";
import { ControllerView } from "@/components/ControllerView";

export const Route = createFileRoute("/controller")({
  head: () => ({
    meta: [
      { title: "Controller — Bachelor Quest" },
      { name: "description", content: "Kontroler Lamy." },
    ],
  }),
  component: ControllerView,
});
