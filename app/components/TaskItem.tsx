"use client";

import { useState } from "react";
import { updateTask, deleteTask } from "@/lib/firestore";
import type { Task } from "@/types/project";
import { Pencil, Trash2, Save, X } from "lucide-react";

type Props = {
  task: Task;
  onUpdated?: () => void;
};

export default function TaskItem({ task, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);

  const toggleComplete = async () => {
    await updateTask(task.id, { isCompleted: !task.isCompleted });
    onUpdated?.();
  };

  const handleRename = async () => {
    await updateTask(task.id, { title: newTitle });
    setIsEditing(false);
    onUpdated?.();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onUpdated?.();
  };

  return (
    <div className="flex items-center justify-between border-b py-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={toggleComplete}
        />
        {isEditing ? (
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
        ) : (
          <span
            className={task.isCompleted ? "line-through text-gray-400" : ""}
          >
            {task.title}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button onClick={handleRename}>
              <Save size={16} className="text-green-600" />
            </button>
            <button onClick={() => setIsEditing(false)}>
              <X size={16} className="text-gray-500" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>
              <Pencil size={16} className="text-blue-500" />
            </button>
            <button onClick={handleDelete}>
              <Trash2 size={16} className="text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
