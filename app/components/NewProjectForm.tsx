"use client";

import { useState } from "react";
import { createProject } from "@/lib/firestore";
import type { Project } from "@/types/project";
import { motion } from "framer-motion";

type Props = {
  ownerId: string;
  existingProjects: Project[];
  onCreated?: () => void;
};

export default function NewProjectForm({
  ownerId,
  existingProjects,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("プロジェクト名は必須です。");
      return;
    }
    setError("");
    await createProject(name.trim(), ownerId, parentId || undefined);
    setName("");
    setParentId("");
    onCreated?.();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-lg font-semibold text-blue-700">
        🆕 プロジェクト追加
      </h2>
      <input
        type="text"
        placeholder="プロジェクト名"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError(""); // 入力が始まったらエラー消去
        }}
        className={`w-full p-3 border rounded-lg focus:outline-none ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />{" "}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <select
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg"
      >
        <option value="">親プロジェクトなし</option>
        {existingProjects.map((proj) => (
          <option key={proj.id} value={proj.id}>
            {proj.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
      >
        作成
      </button>
    </motion.form>
  );
}
