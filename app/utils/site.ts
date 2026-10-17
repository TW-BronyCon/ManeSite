export const SITE_ORIGIN = "https://twbronycon.org";

export function toSiteImageUrl(src: string | null | undefined): string {
  if (!src) return `${SITE_ORIGIN}/img/text-logo.avif`;
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  return `${SITE_ORIGIN}${cleanPath}`;
}
