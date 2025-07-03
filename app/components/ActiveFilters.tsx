// components/ActiveFilters.tsx
import { useTaskFilterStore } from "@/stores/taskFilterStore";

export default function ActiveFilters({
  projectNameMap,
}: {
  projectNameMap: Record<string, string>;
}) {
  const {
    dateFilter,
    labelFilter,
    projectFilter,
    setDateFilter,
    setLabelFilter,
    setProjectFilter,
  } = useTaskFilterStore();

  return (
    <div className="mb-4 space-x-3 text-sm text-gray-600">
      {projectFilter && (
        <span>
          📁 {projectNameMap[projectFilter] ?? "不明なプロジェクト"}{" "}
          <button
            onClick={() => setProjectFilter(null)}
            className="text-blue-500 underline"
          >
            ×
          </button>
        </span>
      )}
      {labelFilter && (
        <span>
          🏷️ ラベル: {labelFilter}{" "}
          <button
            onClick={() => setLabelFilter(null)}
            className="text-blue-500 underline"
          >
            ×
          </button>
        </span>
      )}
      {dateFilter !== "all" && (
        <span>
          📅 日付: {dateFilter === "today" ? "今日" : "今後7日間"}{" "}
          <button
            onClick={() => setDateFilter("all")}
            className="text-blue-500 underline"
          >
            ×
          </button>
        </span>
      )}
    </div>
  );
}
