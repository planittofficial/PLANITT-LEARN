import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

type AlvestLogoVariant = "mark" | "markClear" | "wordmark";

type AlvestLogoProps = {
  variant?: AlvestLogoVariant;
  /** Pixel height for the image. Width follows intrinsic aspect ratio. */
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
};

const SRC: Record<AlvestLogoVariant, string> = {
  mark: BRAND.mark,
  markClear: BRAND.markClear,
  wordmark: BRAND.wordmark,
};

/** Approximate width/height ratios from the source assets. */
const ASPECT: Record<AlvestLogoVariant, number> = {
  mark: 1,
  markClear: 738 / 629,
  // The current public logo asset is a square lockup, not a horizontal wordmark.
  wordmark: 1,
};

export function AlvestLogo({
  variant = "mark",
  size = 40,
  className,
  priority = false,
  alt = BRAND.name,
}: AlvestLogoProps) {
  const height = size;
  const width = Math.round(size * ASPECT[variant]);

  return (
    <img
      src={SRC[variant]}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      onError={(event) => {
        // Keep the brand visible even if a stale deployment is missing the PNG.
        event.currentTarget.onerror = null;
        event.currentTarget.src = BRAND.markClear;
      }}
      className={cn(
        "object-contain",
        variant === "mark" && "rounded-lg",
        className,
      )}
    />
  );
}
