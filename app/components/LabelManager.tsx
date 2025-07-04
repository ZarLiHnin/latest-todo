"use client";

import { useEffect, useState } from "react";
import {
  fetchLabels,
  addLabel,
  updateLabel,
  deleteLabel,
} from "@/lib/firestore";
import { HexColorPicker } from "react-colorful";

type Label = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  ownerId: string;
};

export default function LabelManager({ ownerId }: Props) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#aabbcc");
  const [newNameError, setNewNameError] = useState(""); // 追加：新規入力用エラー

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#aabbcc");
  const [editNameError, setEditNameError] = useState(""); // 追加：編集時のエラー

  useEffect(() => {
    const fetch = async () => {
      const data = await fetchLabels(ownerId);
      setLabels(data);
    };

    fetch();
  }, [ownerId]);

  const loadLabels = async () => {
    const data = await fetchLabels(ownerId);
    setLabels(data);
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setNewNameError("ラベル名は必須です");
      return;
    }
    setNewNameError(""); // エラー解除
    await addLabel(ownerId, newName.trim(), newColor);
    setNewName("");
    setNewColor("#aabbcc");
    loadLabels();
  };

  const startEdit = (label: Label) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
    setEditNameError("");
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      setEditNameError("ラベル名は必須です");
      return;
    }
    setEditNameError("");
    if (!editingId) return;
    await updateLabel(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
    loadLabels();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = async (labelId: string) => {
    if (confirm("ラベルを削除してよろしいですか？")) {
      await deleteLabel(labelId);
      loadLabels();
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">ラベル管理</h2>

      {/* 新規追加フォーム */}
      <div className="mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ラベル名"
          className="border p-2 rounded w-full mb-1"
        />
        {newNameError && (
          <p className="text-red-600 text-sm mb-2">{newNameError}</p>
        )}
        <HexColorPicker color={newColor} onChange={setNewColor} />
        <button
          onClick={handleAdd}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          追加
        </button>
      </div>

      {/* ラベル一覧 */}
      <ul>
        {labels.map((label) => (
          <li key={label.id} className="flex items-center space-x-3 mb-3">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: label.color }}
            />
            {editingId === label.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-1 rounded flex-1 mb-1"
                />
                {editNameError && (
                  <p className="text-red-600 text-xs mb-1">{editNameError}</p>
                )}
                <HexColorPicker color={editColor} onChange={setEditColor} />
                <button
                  onClick={saveEdit}
                  className="text-blue-600 hover:underline ml-2"
                >
                  保存
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-gray-600 hover:underline ml-2"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{label.name}</span>
                <button
                  onClick={() => startEdit(label)}
                  className="text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(label.id)}
                  className="text-red-700 hover:underline ml-2"
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
