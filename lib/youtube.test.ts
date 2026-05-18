import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractYouTubeVideoId,
  resolveLessonVideoEmbedUrl,
  youtubeEmbedSrc,
} from "./youtube";

describe("extractYouTubeVideoId", () => {
  it("parses watch URLs", () => {
    assert.equal(
      extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("parses youtu.be links", () => {
    assert.equal(
      extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("parses embed and shorts paths", () => {
    assert.equal(
      extractYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
    assert.equal(
      extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  it("accepts bare 11-char ids", () => {
    assert.equal(extractYouTubeVideoId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  });

  it("returns null for invalid input", () => {
    assert.equal(extractYouTubeVideoId("not-a-url"), null);
    assert.equal(extractYouTubeVideoId(""), null);
  });
});

describe("resolveLessonVideoEmbedUrl", () => {
  it("converts YouTube URLs to nocookie embed", () => {
    const out = resolveLessonVideoEmbedUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    assert.equal(out, youtubeEmbedSrc("dQw4w9WgXcQ"));
  });

  it("leaves non-YouTube URLs unchanged", () => {
    const r2 =
      "https://cdn.example.com/lessons/intro.mp4?X-Amz-Signature=abc";
    assert.equal(resolveLessonVideoEmbedUrl(r2), r2);
  });
});
