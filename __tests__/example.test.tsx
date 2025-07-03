import { describe, it, expect, vi } from "vitest";

/// <reference types="vitest" />
describe("test", () => {
  it("should work", () => {
    const spy = vi.fn();
    spy();
    expect(spy).toHaveBeenCalled();
  });
});
