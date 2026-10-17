import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  parseMarkdownWithFrontmatter,
  renderMarkdownWithAttachments,
} from "../app/utils/markdown.ts";
import { formatNewsDate } from "../app/utils/date.ts";
import { SITE_ORIGIN, toSiteImageUrl } from "../app/utils/site.ts";

test("frontmatter preserves body, first-colon values and quote policies", () => {
  const body = "\r\nBody: exact\r\n";
  const raw =
    "---\r\ntitle: \"A: B\"\r\nkey: first\r\nkey: last\r\nsingle: 'quoted'\r\n---\r\n" +
    body;
  assert.deepEqual(parseMarkdownWithFrontmatter(raw, "strip-matching"), {
    meta: { title: "A: B", key: "last", single: "quoted" },
    content: body,
  });
  assert.deepEqual(parseMarkdownWithFrontmatter(raw, "preserve"), {
    meta: { title: '"A: B"', key: "last", single: "'quoted'" },
    content: body,
  });
  for (const input of [
    "Body without frontmatter",
    "---\ntitle: unclosed\nBody",
    "\n---\ntitle: not anchored\n---\nBody",
  ]) {
    for (const mode of ["strip-matching", "preserve"]) {
      assert.deepEqual(parseMarkdownWithFrontmatter(input, mode), {
        meta: {},
        content: input,
      });
    }
  }
});

test("attachments rewrite only asset paths and preserve ordered duplicate images", () => {
  const { html, images } = renderMarkdownWithAttachments(
    [
      "Body prose remains.",
      "![Public image](../../../public/img/poster.png)",
      "![Event image](/events/rainboom/poster.png?x=1)",
      '<img src="https://example.com/external.png">',
      "![Public image](../../../public/img/poster.png)",
      "[Event entry](/events/entry)",
    ].join("\n\n"),
  );
  assert.deepEqual(images, [
    { src: "/img/poster.png", alt: "Public image" },
    { src: "/img/events/rainboom/poster.png?x=1", alt: "Event image" },
    { src: "https://example.com/external.png", alt: "" },
    { src: "/img/poster.png", alt: "Public image" },
  ]);
  assert.match(html, /Body prose remains\./);
  assert.match(html, /href="\/events\/entry"/);
  assert.doesNotMatch(html, /<img\b/i);
  assert.deepEqual(renderMarkdownWithAttachments(""), { html: "", images: [] });
});

test("real news fixture keeps poster order and event navigation URL", async () => {
  const raw = await readFile(
    new URL("../app/content/news/post_009.en.md", import.meta.url),
    "utf8",
  );
  const { meta, content } = parseMarkdownWithFrontmatter(raw, "strip-matching");
  assert.equal(meta.title, "Sonic Rainboom Late-Night Event!");
  const { html, images } = renderMarkdownWithAttachments(content);
  assert.deepEqual(images, [
    {
      src: "/img/events/rainboom/TWBC_Poster_DJ3.png",
      alt: "Sonic Rainboom Poster",
    },
    {
      src: "/img/events/rainboom/TWBC_Poster_Sing_Alone_List.png",
      alt: "Sonic Rainboom Poster",
    },
  ]);
  assert.match(
    html,
    /href="https:\/\/twbronycon\.org\/events\/sonic-rainboom"/,
  );
  assert.doesNotMatch(html, /<img\b/i);
});

test("news date uses Taipei date and preserves empty or invalid input", () => {
  assert.equal(formatNewsDate("2026-07-23T16:30:00Z", "en"), "07/24/2026");
  assert.equal(formatNewsDate("", "en"), "");
  assert.equal(formatNewsDate("not-a-date", "en"), "not-a-date");
});

test("site images prefix local assets and preserve absolute or data sources", () => {
  for (const src of [undefined, null, ""]) {
    assert.equal(toSiteImageUrl(src), `${SITE_ORIGIN}/img/text-logo.avif`);
  }
  for (const src of ["img/poster.png", "/img/poster.png"]) {
    assert.equal(toSiteImageUrl(src), `${SITE_ORIGIN}/img/poster.png`);
  }
  for (const src of [
    "https://example.com/a.png",
    "http://example.com/a.png",
    "data:image/png;base64,abc",
  ]) {
    assert.equal(toSiteImageUrl(src), src);
  }
});
