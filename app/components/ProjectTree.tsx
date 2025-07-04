"use client";

import { useState } from "react";
import type { ProjectNode, Project } from "@/types/project";
import { updateProject, deleteProject } from "@/lib/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Folder } from "lucide-react";

interface Props {
  nodes: ProjectNode[];
  renderItem?: (project: Project) => React.ReactNode;
  onUpdated: () => void;
  depth?: number; // 階層レベルを受け取る
}

export default function ProjectTree({
  nodes,
  renderItem,
  onUpdated,
  depth = 0,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParent, setEditParent] = useState<string>("");

  const handleEdit = (node: Project) => {
    setEditingId(node.id);
    setEditName(node.name);
    setEditParent(node.parentId || "");
  };

  const handleSave = async (id: string) => {
    const data: Partial<Omit<Project, "id">> = { name: editName };
    if (editParent) data.parentId = editParent;
    await updateProject(id, data);
    setEditingId(null);
    onUpdated();
  };

  const handleDelete = async (id: string) => {
    if (confirm("本当に削除しますか？")) {
      await deleteProject(id);
      onUpdated();
    }
  };

  return (
    <ul className="ml-4 space-y-2">
      {nodes.map((node) => (
        <li
          key={node.id}
          className={`${
            depth === 0 ? "bg-blue-50" : "bg-white"
          } rounded-lg p-3 shadow-inner`}
        >
          <AnimatePresence>
            {editingId === node.id ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                  value={editParent}
                  onChange={(e) => setEditParent(e.target.value)}
                  className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">親プロジェクトなし</option>
                  {nodes
                    .filter((p) => p.id !== node.id)
                    .map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave(node.id)}
                    className="flex-1 bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 transition"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-1 rounded-lg hover:bg-gray-300 transition"
                  >
                    キャンセル
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2 text-blue-900 font-medium">
                  <Folder className="w-5 h-5 text-blue-600" />
                  <div>{renderItem ? renderItem(node) : node.name}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(node)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(node.id)}
                    className="text-sm text-red-700 hover:text-red-800 transition"
                  >
                    削除
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {node.children.length > 0 && (
            <ProjectTree
              nodes={node.children}
              renderItem={renderItem}
              onUpdated={onUpdated}
              depth={depth + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
