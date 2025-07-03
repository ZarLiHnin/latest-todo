import React from "react"; // ここが必須！
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewTaskForm from "@/app/components/NewTaskForm";
import * as firestore from "@/lib/firestore";

vi.mock("@/lib/firestore", () => ({
  addTaskWithLabels: vi.fn(),
}));

const mockAddTaskWithLabels = firestore.addTaskWithLabels as ReturnType<
  typeof vi.fn
>;

describe("NewTaskForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = () => {
    return render(
      <NewTaskForm
        projectId="project-1"
        labels={[
          { id: "label-1", name: "重要", color: "#ff0000", ownerId: "owner1" },
          { id: "label-2", name: "緊急", color: "#00ff00", ownerId: "owner2" },
        ]}
      />
    );
  };

  it("バリデーション: タイトルが空だとエラー表示", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /タスク追加/i }));

    expect(await screen.findByText("タイトルは必須です")).toBeInTheDocument();

    expect(mockAddTaskWithLabels).not.toHaveBeenCalled();
  });

  it("正常送信: Firestore にタスクが送信されること", async () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText("タスクのタイトル"), {
      target: { value: "テストタスク" },
    });

    fireEvent.change(screen.getByPlaceholderText("メモ（任意）"), {
      target: { value: "メモ内容" },
    });

    fireEvent.click(screen.getByLabelText("重要"));

    fireEvent.click(screen.getByRole("button", { name: /タスク追加/i }));

    await waitFor(() => {
      expect(mockAddTaskWithLabels).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockAddTaskWithLabels.mock.calls[0];
    const taskData = callArgs[0];
    const selectedLabels = callArgs[1];

    expect(taskData.title).toBe("テストタスク");
    expect(taskData.memo).toBe("メモ内容");
    expect(taskData.projectId).toBe("project-1");
    expect(selectedLabels).toContain("label-1");
  });
});
