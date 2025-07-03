// lib/utils/__tests__/formatDate.test.ts
import { formatDate } from "../formatDate";
import { describe, it, expect } from "vitest";

describe("formatDate", () => {
  it("正しいフォーマットで日付を返す", () => {
    const input = "2025-07-02T10:30:00.000Z";
    const output = formatDate(input);
    expect(output).toMatch(/2025\/07\/02.*19:30/); // JST 変換を考慮
  });
});
