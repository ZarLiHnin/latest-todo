import { describe, it, expect } from "vitest";
import { formatDate } from "../formatDate";

describe("formatDate", () => {
  it("正しいフォーマットで日付を返す", () => {
    const input = "2025-07-02T10:30:00.000Z"; // UTC
    const output = formatDate(input);
    expect(output).toMatch(/2025\/07\/02.*19:30/); // JSTに変換されている前提
  });
});
