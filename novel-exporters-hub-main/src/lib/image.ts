interface ImageOptions {
  width?: number;
  quality?: number;
}

// Optimize external CDN images (Unsplash) without changing local asset paths.
export const optimizeImageUrl = (src: string, options: ImageOptions = {}): string => {
  if (!src || !src.includes("images.unsplash.com")) {
    return src;
  }

  const { width = 1200, quality = 75 } = options;

  try {
    const url = new URL(src);
    url.searchParams.set("auto", "format,compress");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", String(quality));
    url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return src;
  }
};
