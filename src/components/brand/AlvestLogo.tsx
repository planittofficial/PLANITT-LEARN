import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

type AlvestLogoVariant = "mark" | "markClear" | "wordmark";

type AlvestLogoProps = {
  variant?: AlvestLogoVariant;
  /** Rendered height in pixels; width scales from the asset aspect ratio. */
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
};

const VARIANT_CONFIG: Record<
  AlvestLogoVariant,
  { src: string; aspect: number; fallbacks: string[] }
> = {
  mark: {
    src: BRAND.mark,
    aspect: 1,
    fallbacks: [BRAND.markClearPng, BRAND.wordmark],
  },
  markClear: {
    src: BRAND.markClear,
    aspect: 738 / 629,
    fallbacks: [BRAND.markClearPng, BRAND.mark],
  },
  wordmark: {
    src: BRAND.wordmark,
    aspect: 1,
    fallbacks: [BRAND.markClearPng, BRAND.markClear, BRAND.mark],
  },
};

export function AlvestLogo({
  variant = "markClear",
  size = 40,
  className,
  priority = false,
  alt = BRAND.product,
}: AlvestLogoProps) {
  const { src, aspect, fallbacks } = VARIANT_CONFIG[variant];
  const width = Math.max(Math.round(size * aspect), size);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={(event) => {
        const img = event.currentTarget;
        const idx = Number(img.dataset.fallbackIdx ?? "0");
        if (idx >= fallbacks.length) return;
        img.dataset.fallbackIdx = String(idx + 1);
        img.src = fallbacks[idx];
      }}
      className={cn(
        "block shrink-0 object-contain object-left",
        variant === "mark" && "rounded-lg",
        className,
      )}
      style={{ height: size, width: "auto", minHeight: size, maxHeight: size }}
    />
  );
}
