import { marked } from "marked";
import type { MarkdownImage } from "../types/content";

// Simple yaml-like frontmatter parser
export function parseMarkdownWithFrontmatter(
  raw: string,
  quoteMode: "strip-matching" | "preserve",
): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    const yamlBlock = match[1] || "";
    const markdownContent = match[2] || "";

    const meta: Record<string, string> = {};
    yamlBlock.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        let cleanVal = value;
        if (
          quoteMode === "strip-matching" &&
          ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
        ) {
          cleanVal = value.slice(1, -1);
        }
        meta[key] = cleanVal;
      }
    });

    return { meta, content: markdownContent };
  }
  return { meta: {}, content: raw };
}

export function renderMarkdownWithAttachments(content: string): {
  html: string;
  images: MarkdownImage[];
} {
  if (!content) return { html: "", images: [] };

  let html = marked.parse(content, { async: false });

  // Resolve references to the public folder (e.g. src="/public/img/..." or src="../../../public/img/...")
  html = html.replace(
    /(src|href)=["']\/?(?:\.\.\/)*public\/([^"']+)["']/g,
    '$1="/$2"',
  );

  // Map /events/[id]/image.png to /img/events/[id]/image.png for event-relative images
  const imageExtensionPattern =
    /\.(png|jpe?g|gif|svg|webp|avif)(?:\?[^"']*)?$/i;
  html = html.replace(/src=["']\/events\/([^"']+)["']/g, (match, p1) => {
    if (imageExtensionPattern.test(p1)) {
      return `src="/img/events/${p1}"`;
    }
    return match;
  });

  // Extract all images from the HTML
  const images: MarkdownImage[] = [];
  const imgTagRegex = /<img([^>]+)>/gi;
  let imgMatch;
  while ((imgMatch = imgTagRegex.exec(html)) !== null) {
    const attributes = imgMatch[1];
    if (attributes) {
      const srcMatch = attributes.match(/src=["']([^"']+)["']/i);
      const altMatch = attributes.match(/alt=["']([^"']*)["']/i);

      if (srcMatch && srcMatch[1]) {
        images.push({
          src: srcMatch[1],
          alt: altMatch && altMatch[1] ? altMatch[1] : "",
        });
      }
    }
  }

  // Remove paragraphs containing only images and whitespace
  html = html.replace(
    /<p>(?:\s|<br\s*\/?>)*<img[^>]+src=["']([^"']+)["'][^>]*>(?:\s|<br\s*\/?>)*<\/p>/gi,
    "",
  );
  // Remove standalone <img> tags
  html = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, "");

  return { html, images };
}
