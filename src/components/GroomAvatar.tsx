import { GROOM_AVATAR_URL } from "@/data/gameData";

interface Props {
  size?: number;
  url?: string | null;
}

export function GroomAvatar({ size = 64, url }: Props) {
  const src = url ?? GROOM_AVATAR_URL;
  return (
    <div
      className="relative flex items-center justify-center rounded-full border-4 border-fuchsia-400 bg-gradient-to-br from-fuchsia-500 to-cyan-500 shadow-[0_0_30px_rgba(217,70,239,0.8)]"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt="Pan Młody"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span style={{ fontSize: size * 0.55 }}>🤵</span>
      )}
    </div>
  );
}
