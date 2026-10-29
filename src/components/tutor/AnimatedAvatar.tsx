// Loaded only when tutor_avatar_assets names an animated file. Until the illustration team
// delivers a Rive or Lottie parrot, no player is bundled: the still image shows instead.
// When the file arrives, add the player package here; nothing else changes.
import type { AvatarAsset } from "./LiveTutor";

export default function AnimatedAvatar({ asset, fallback }: { asset: AvatarAsset; fallback: string }) {
  return <img src={fallback} alt="" data-animated-src={asset.url} data-animated-type={asset.type} className="absolute inset-0 h-full w-full object-contain object-bottom" />;
}
