import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { adminTopicHref } from "./admin-lessons-nav";

describe("adminTopicHref", () => {
  it("opens the lesson editor directly when the topic has exactly one lesson", () => {
    assert.equal(
      adminTopicHref("thun-tula-ft", "ict-2023", [
        { slug: "thun-tula-ft-2023-ict-mentorship" },
      ]),
      "/admin/lessons/edit/thun-tula-ft-2023-ict-mentorship",
    );
  });

  it("falls back to the lessons list when the topic has multiple lessons", () => {
    assert.equal(
      adminTopicHref("thun-tula-ft", "csnr", [
        { slug: "csnr-intro" },
        { slug: "csnr-advanced" },
      ]),
      "/admin/lessons?mentor=thun-tula-ft&topic=csnr",
    );
  });

  it("falls back to the lessons list when the topic has no lessons yet", () => {
    assert.equal(
      adminTopicHref("thun-tula-ft", "super", []),
      "/admin/lessons?mentor=thun-tula-ft&topic=super",
    );
  });

  it("URL-encodes the lesson slug", () => {
    assert.equal(
      adminTopicHref("m", "t", [{ slug: "a b" }]),
      "/admin/lessons/edit/a%20b",
    );
  });
});
