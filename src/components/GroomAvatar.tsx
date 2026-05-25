import { useState } from "react";
import { GROOM_AVATAR_URL, GROOM } from "@/data/gameData";

interface Props {
  size?: number;
  url?: string | null;
}

export function GroomAvatar({ size = 64, url }: Props) {
  const src = url ?? GROOM_AVATAR_URL;
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center rounded-full border-4 border-fuchsia-400 bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-[0_0_30px_rgba(217,70,239,0.8)]"
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={GROOM.nickname}
          className="h-full w-full rounded-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ fontSize: size * 0.55 }}>🦙</span>
      )}
    </div>
  );
}
