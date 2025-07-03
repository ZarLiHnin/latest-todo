"use client";

import { useState } from "react";
import { ProjectNode } from "@/types/project";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Check, X } from "lucide-react";

type Props = {
  node: ProjectNode;
  onUpdated?: () => void;
};

export default function ProjectItem({ node, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [expanded, setExpanded] = useState(true);

  const handleRename = async () => {
    // TODO: Firestore更新関数（updateProject）を呼び出す
    // await updateProject(node.id, { name: newName });
    setIsEditing(false);
    onUpdated?.();
  };

  const handleDelete = async () => {
    // TODO: Firestore削除関数（deleteProject）を呼び出す
    // await deleteProject(node.id);
    onUpdated?.();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="ml-4 border-l-2 border-blue-200 pl-4 space-y-1"
    >
      <div className="flex items-center justify-between group">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button
              className="text-green-600 hover:text-green-800"
              onClick={handleRename}
            >
              <Check size={16} />
            </button>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setIsEditing(false);
                setNewName(node.name);
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded((prev) => !prev)}>
              <span className="text-blue-700 font-medium hover:underline">
                {node.name}
              </span>
            </button>
            <div className="invisible group-hover:visible flex gap-1">
              <button onClick={() => setIsEditing(true)} title="Rename">
                <Pencil
                  size={16}
                  className="text-blue-500 hover:text-blue-700"
                />
              </button>
              <button onClick={handleDelete} title="Delete">
                <Trash2 size={16} className="text-red-500 hover:text-red-700" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && node.children.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-4"
          >
            {node.children.map((child) => (
              <ProjectItem key={child.id} node={child} onUpdated={onUpdated} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
