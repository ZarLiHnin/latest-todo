// components/TaskFilterControls.tsx
"use client";

import { useTaskFilterStore } from "@/stores/taskFilterStore";
import type { Label, Project } from "@/types/project";
import { DateFilter } from "@/types/taskFilter";

type Props = {
  labels?: Label[];
  projects?: Project[];
};

const dateOptions: DateFilter[] = ["all", "today", "next7days"];

export default function TaskFilterControls({
  labels = [],
  projects = [],
}: Props) {
  const {
    dateFilter,
    labelFilter,
    projectFilter,
    setDateFilter,
    setLabelFilter,
    setProjectFilter,
  } = useTaskFilterStore();

  return (
    <div className="space-y-4">
      {/* 日付フィルター */}
      <div className="flex gap-2 items-center">
        <span className="font-semibold">📅 日付:</span>
        {dateOptions.map((option) => (
          <button
            key={option}
            onClick={() => setDateFilter(option)}
            className={`px-2 py-1 rounded ${
              dateFilter === option ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {option === "all"
              ? "すべて"
              : option === "today"
              ? "今日"
              : "今後7日間"}
          </button>
        ))}
      </div>

      {/* ラベルフィルター */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="font-semibold">🏷️ ラベル:</span>
        <button
          onClick={() => setLabelFilter(null)}
          className={`px-2 py-1 rounded ${
            labelFilter === null ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          すべて
        </button>
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => setLabelFilter(label.id)}
            className={`px-2 py-1 rounded text-white`}
            style={{
              backgroundColor: labelFilter === label.id ? label.color : "#ccc",
            }}
          >
            {label.name}
          </button>
        ))}
      </div>

      {/* プロジェクトフィルター */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="font-semibold">📁 プロジェクト:</span>
        <button
          onClick={() => setProjectFilter(null)}
          className={`px-2 py-1 rounded ${
            projectFilter === null ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          すべて
        </button>
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setProjectFilter(project.id)}
            className={`px-2 py-1 rounded ${
              projectFilter === project.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {project.name}
          </button>
        ))}
      </div>
    </div>
  );
}
