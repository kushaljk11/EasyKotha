import { useMemo, useState } from "react";

function firstCharacter(name, fallback = "U") {
  const value = String(name || "").trim();
  if (!value) return fallback;
  return value.charAt(0).toUpperCase();
}

export default function UserAvatar({
  src,
  name,
  sizeClass = "h-10 w-10",
  textClass = "text-sm",
  className = "",
  alt = "User avatar",
}) {
  const [imageError, setImageError] = useState(false);
  const initial = useMemo(() => firstCharacter(name), [name]);
  const normalizedSrc = typeof src === "string" ? src.trim() : "";
  const shouldShowImage = Boolean(normalizedSrc) && !imageError;

  if (shouldShowImage) {
    return (
      <img
        src={normalizedSrc}
        alt={alt}
        onError={() => setImageError(true)}
        className={`${sizeClass} rounded-full object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <div
      aria-label={alt}
      className={`${sizeClass} inline-flex items-center justify-center rounded-full bg-green-800 text-white ${textClass} ${className}`.trim()}
    >
      <span className="font-semibold leading-none">{initial}</span>
    </div>
  );
}
