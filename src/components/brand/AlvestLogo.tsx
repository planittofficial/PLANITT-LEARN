import Image from "next/image";

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
  wordmark: 2.2,
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
    <Image
      src={SRC[variant]}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      // Keep public brand assets as direct static files. This avoids the
      // image optimizer returning a broken URL for user-provided PNGs.
      unoptimized
      className={cn(
        "object-contain",
        variant === "mark" && "rounded-lg",
        className,
      )}
    />
  );
}
