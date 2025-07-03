"use client";

import { useForm } from "react-hook-form";
import { addTaskWithLabels } from "@/lib/firestore";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import type { Label } from "@/types/project";

type TaskFormInputs = {
  title: string;
  memo?: string;
  dueDate?: string; // ISO形式
};

type Props = {
  projectId: string;
  onTaskAdded?: () => void;
  labels?: Label[];
};

export default function NewTaskForm({
  projectId,
  onTaskAdded,
  labels = [],
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInputs>();

  const [selectedDay, setSelectedDay] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const dueDate = watch("dueDate");

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "未設定";
    return dayjs(isoString).format("YYYY年MM月DD日 HH:mm");
  };

  const updateDueDate = (day: Date | undefined, time: string) => {
    if (!day) {
      setValue("dueDate", "");
      return;
    }

    const [hourStr, minuteStr] = time ? time.split(":") : ["0", "0"];
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (isNaN(hour) || isNaN(minute)) {
      setValue("dueDate", "");
      return;
    }

    const formatted = dayjs(day)
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0)
      .toISOString();

    setValue("dueDate", formatted);
  };

  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDay(day);
    updateDueDate(day, selectedTime);
    setShowCalendar(false); // カレンダー自動で閉じる
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setSelectedTime(time);
    updateDueDate(selectedDay, time);
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const onSubmit = async (data: TaskFormInputs) => {
    try {
      await addTaskWithLabels(
        {
          ...data,
          isCompleted: false,
          projectId,
        },
        selectedLabels
      );

      reset();
      setSelectedDay(undefined);
      setSelectedTime("");
      setSelectedLabels([]);
      setShowCalendar(false);
      onTaskAdded?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-200"
    >
      <input
        {...register("title", { required: "タイトルは必須です" })}
        placeholder="タスクのタイトル"
        className="w-full p-2 border rounded"
      />
      {errors.title && (
        <p className="text-red-500 text-sm">{errors.title.message}</p>
      )}

      <input
        {...register("memo")}
        placeholder="メモ（任意）"
        className="w-full p-2 border rounded"
      />

      {/* 期日 */}
      <div>
        <label className="block mb-1 font-medium">期日を設定</label>

        {/* カレンダーアイコンボタン */}
        <button
          type="button"
          onClick={() => setShowCalendar((prev) => !prev)}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 underline text-sm mt-1"
        >
          <span>🗓️</span>
          <span>{selectedDay ? "変更する" : "日付を選択する"}</span>
        </button>

        {/* カレンダー本体 */}
        {showCalendar && (
          <div className="mt-3 p-4 bg-white rounded-xl shadow-md border w-fit">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleDaySelect}
              styles={{
                caption: { textAlign: "center", marginBottom: "0.5rem" },
                day_selected: { backgroundColor: "#2563eb", color: "white" },
              }}
            />
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(undefined);
                  updateDueDate(undefined, selectedTime);
                  setShowCalendar(false);
                }}
                className="text-sm text-red-500 underline"
              >
                期日をクリア
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 時間 */}
      <div>
        <label htmlFor="time" className="block mb-1 font-medium">
          時間を選択 (任意)
        </label>
        <input
          id="time"
          type="time"
          value={selectedTime}
          onChange={handleTimeChange}
          className="border p-2 rounded w-full"
        />
      </div>

      <input type="hidden" {...register("dueDate")} />
      {dueDate && (
        <div className="flex items-center text-sm text-gray-700">
          <span className="mr-2 font-medium text-gray-500">選択中の期日:</span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full shadow-sm">
            {formatDateTime(dueDate)}
          </span>
        </div>
      )}

      {/* ラベル */}
      <div>
        <label className="block mb-1 font-medium">ラベルを割り当てる</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {labels.map((label) => (
            <label key={label.id} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={selectedLabels.includes(label.id)}
                onChange={() => toggleLabel(label.id)}
              />
              <span
                className="px-2 py-1 rounded text-white text-xs"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            </label>
          ))}
        </div>
        {/* ここにラベル管理ページへのリンクを追加 */}
        <div className="mt-2 text-right">
          <a
            href="/labels"
            className="text-sm text-blue-600 hover:underline"
            target="_blank" // 新しいタブで開きたい場合
            rel="noopener noreferrer"
          >
            ラベルを追加・編集する
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        タスク追加
      </button>
    </form>
  );
}
