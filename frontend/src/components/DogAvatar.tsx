import { PawPrint } from "lucide-react";

export default function DogAvatar({
  photoUrl,
  size = 56,
  className = "",
}: {
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        style={{ width: size, height: size }}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-coral-200 to-coral-400 text-white ${className}`}
    >
      <PawPrint size={size * 0.5} strokeWidth={2} />
    </div>
  );
}
