// types/project.ts

export type Project = {
  id: string;
  name: string;
  ownerId: string;
  parentId?: string;
};

// 🔸 Task 型を定義して export
export type Task = {
  id: string;
  title: string;
  memo?: string;
  dueDate?: string;
  isCompleted: boolean;
  projectId: string;
  labels?: string[]; // ← これを追加！
};

export type Label = {
  id: string;
  name: string;
  color: string;
  ownerId: string;
};

// 🔸 子プロジェクトを持つ構造（すでにあるならOK）
export type ProjectNode = Project & {
  children: ProjectNode[];
};
