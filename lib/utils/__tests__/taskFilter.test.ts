import { describe, it, expect } from "vitest";
import { filterCompleted, filterIncomplete } from "../taskFilter";

const tasks = [
  { id: "1", title: "A", isCompleted: true, projectId: "id1" },
  { id: "2", title: "B", isCompleted: false, projectId: "id2" },
  { id: "3", title: "C", isCompleted: true, projectId: "id3" },
];

describe("タスクフィルター関数", () => {
  it("完了済みタスクだけを抽出する", () => {
    const result = filterCompleted(tasks);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.isCompleted)).toBe(true);
  });

  it("未完了タスクだけを抽出する", () => {
    const result = filterIncomplete(tasks);
    expect(result).toHaveLength(1);
    expect(result[0].isCompleted).toBe(false);
  });
});
