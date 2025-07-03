"use client";

import { useState, useEffect } from "react";
import { updateTask, deleteTask } from "@/lib/firestore";
import type { Task, Label, Project } from "@/types/project";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfToday, endOfToday, addDays, endOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { FaStickyNote } from "react-icons/fa";
import { fetchLabelsMapForTasks } from "@/lib/firestore";
import { useTaskFilterStore } from "@/stores/taskFilterStore";
import TaskFilterControls from "./TaskFilterControls";
import ActiveFilters from "./ActiveFilters";

type Props = {
  tasks: Task[];
  labels?: Label[];
  projects?: Project[];
  onTasksChanged?: () => void;
};

export default function TaskList({
  tasks,
  labels = [],
  projects = [],
  onTasksChanged,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<
    "title" | "dueDate" | "memo" | null
  >(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState<string>("");
  const [editMemo, setEditMemo] = useState("");

  // 🔽 project.id → name に変換するマップを作成
  const projectNameMap = projects.reduce<Record<string, string>>(
    (acc, project) => {
      acc[project.id] = project.name;
      return acc;
    },
    {}
  );

  const toggleComplete = async (task: Task) => {
    await updateTask(task.id, { isCompleted: !task.isCompleted });
    onTasksChanged?.();
  };

  const startEditingTitle = (task: Task) => {
    setEditingId(task.id);
    setEditingField("title");
    setEditTitle(task.title);
  };

  const startEditingDueDate = (task: Task) => {
    setEditingId(task.id);
    setEditingField("dueDate");
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 16) : "");
  };

  const startEditingMemo = (task: Task) => {
    setEditingId(task.id);
    setEditingField("memo");
    setEditMemo(task.memo ?? "");
  };

  const saveEditTitle = async (task: Task) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;

    await updateTask(task.id, { title: trimmed });
    setEditingId(null);
    setEditingField(null);
    onTasksChanged?.();
  };

  const saveEditDueDate = async (task: Task) => {
    const newDueDate = editDueDate
      ? new Date(editDueDate).toISOString()
      : undefined;

    await updateTask(task.id, { dueDate: newDueDate });
    setEditingId(null);
    setEditingField(null);
    onTasksChanged?.();
  };

  const saveEditMemo = async (task: Task) => {
    await updateTask(task.id, { memo: editMemo.trim() });
    setEditingId(null);
    setEditingField(null);
    onTasksChanged?.();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditTitle("");
    setEditDueDate("");
    setEditMemo("");
  };

  const deleteTaskById = async (taskId: string) => {
    if (confirm("本当にこのタスクを削除しますか？")) {
      await deleteTask(taskId);
      onTasksChanged?.();
    }
  };

  // ラベルマップ取得
  const [taskLabelsMap, setTaskLabelsMap] = useState<Record<string, Label[]>>(
    {}
  );

  useEffect(() => {
    fetchLabelsMapForTasks(tasks.map((t) => t.id)).then(setTaskLabelsMap);
  }, [tasks]);

  // Zustand からフィルター条件取得
  const { dateFilter, labelFilter, projectFilter } = useTaskFilterStore();

  // フィルター関数
  const filteredTasks = tasks.filter((task) => {
    // 日付フィルター
    if (dateFilter !== "all") {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      const start = startOfToday();
      const end =
        dateFilter === "today" ? endOfToday() : endOfDay(addDays(start, 7));
      if (!(due >= start && due <= end)) return false;
    }
    // ラベルフィルター
    if (labelFilter) {
      const ids = taskLabelsMap[task.id]?.map((l) => l.id) ?? [];
      if (!ids.includes(labelFilter)) return false;
    }
    // プロジェクトフィルター
    if (projectFilter && task.projectId !== projectFilter) return false;
    return true;
  });

  return (
    <ul className="space-y-3">
      <TaskFilterControls labels={labels} projects={projects} />
      <ActiveFilters projectNameMap={projectNameMap} />
      <AnimatePresence>
        {filteredTasks.map((task) => (
          <motion.li
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-blue-50 rounded shadow flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => toggleComplete(task)}
                className="w-5 h-5"
              />

              {editingId === task.id && editingField === "title" ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border-b border-blue-500 focus:outline-none w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEditTitle(task);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className={`cursor-pointer select-none ${
                    task.isCompleted ? "line-through text-gray-400" : ""
                  }`}
                  onClick={() => startEditingTitle(task)}
                >
                  {task.title}
                </span>
              )}

              <div>
                <div className="flex space-x-2 mt-1">
                  {(taskLabelsMap[task.id] || []).map((label) => (
                    <span
                      key={label.id}
                      className="inline-block px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>

              <FaStickyNote
                onClick={() => {
                  if (editingId !== task.id || editingField !== "memo") {
                    startEditingMemo(task);
                  } else {
                    cancelEdit();
                  }
                }}
                className={`ml-2 cursor-pointer ${
                  task.memo && task.memo.trim() !== ""
                    ? "text-yellow-500"
                    : "text-gray-400"
                } ${
                  editingId === task.id && editingField === "memo"
                    ? "opacity-60"
                    : "opacity-100"
                }`}
                title={task.memo ? "メモを編集" : "メモを追加"}
                aria-label={task.memo ? "メモを編集" : "メモを追加"}
              />
            </div>

            <div className="text-sm text-gray-500 text-right min-w-[140px]">
              {editingId === task.id && editingField === "dueDate" ? (
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="border-b border-blue-500 focus:outline-none w-full"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      await saveEditDueDate(task);
                    }
                    if (e.key === "Escape") {
                      cancelEdit();
                    }
                  }}
                  autoFocus
                />
              ) : task.dueDate ? (
                <span
                  className="cursor-pointer"
                  onClick={() => startEditingDueDate(task)}
                >
                  {format(new Date(task.dueDate), "yyyy年M月d日 HH:mm", {
                    locale: ja,
                  })}
                </span>
              ) : (
                <span
                  className="cursor-pointer"
                  onClick={() => startEditingDueDate(task)}
                >
                  ⏳ 期日なし
                </span>
              )}
            </div>

            <div className="flex flex-col w-full md:w-auto mt-2 md:mt-0 min-w-[180px]">
              {editingId === task.id && editingField === "memo" ? (
                <>
                  <textarea
                    className="border rounded p-2 resize-y w-full"
                    rows={3}
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        saveEditMemo(task);
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                    placeholder="メモを入力してください"
                  />
                  <div className="mt-1 flex space-x-2">
                    <button
                      onClick={() => saveEditMemo(task)}
                      className="text-blue-600 hover:underline"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-600 hover:underline"
                    >
                      キャンセル
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => startEditingMemo(task)}
                  className="text-sm text-gray-600 hover:underline text-left"
                >
                  {task.memo ? "メモあり（クリックして編集）" : "メモを追加"}
                </button>
              )}
            </div>

            <div className="flex space-x-2 mt-2 md:mt-0">
              {editingId !== task.id && (
                <button
                  onClick={() => deleteTaskById(task.id)}
                  className="text-red-600 hover:underline"
                >
                  削除
                </button>
              )}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
