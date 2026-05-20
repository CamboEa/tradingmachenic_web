import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    assert.equal(slugify("Price Action Basics"), "price-action-basics");
  });

  it("strips special characters", () => {
    assert.equal(slugify("Part 1 — Setup & Playbook!"), "part-1-setup-playbook");
  });

  it("collapses multiple hyphens", () => {
    assert.equal(slugify("foo   bar"), "foo-bar");
  });
});
