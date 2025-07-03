// lib/firestore.ts
import {
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteField,
  documentId,
} from "firebase/firestore";
import { db } from "./firebase"; // ← ✅ ここで初めて使ってOK
import type { Task } from "@/types/project";
import type { Project } from "@/types/project";
import type { Label } from "@/types/project";

export type ProjectData = {
  id: string;
  name: string;
  ownerId: string;
  parentId?: string;
};

export async function fetchProjects(userId: string): Promise<ProjectData[]> {
  const q = query(collection(db, "projects"), where("ownerId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProjectData[];
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const projectQuery = query(
    collection(db, "projects"),
    where("ownerId", "==", userId)
  );
  const projectSnapshot = await getDocs(projectQuery);
  const userProjectIds = projectSnapshot.docs.map((doc) => doc.id);

  const taskSnapshot = await getDocs(collection(db, "tasks"));
  const allTasks = taskSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];

  const filteredTasks = allTasks.filter((task) =>
    userProjectIds.includes(task.projectId)
  );

  return filteredTasks;
}

// 🔸 作成
export async function createProject(
  name: string,
  ownerId: string,
  parentId?: string
): Promise<string> {
  const data = {
    name,
    ownerId,
    ...(parentId ? { parentId } : {}),
  };
  const docRef = await addDoc(collection(db, "projects"), data);
  return docRef.id;
}

// 🔸 更新

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id">>
) {
  const ref = doc(db, "projects", id);

  if (data.parentId === undefined) {
    // 親なしにするなら削除も可能（呼び出し側で undefined にセットしないと使わない）
    await updateDoc(ref, { ...data, parentId: deleteField() });
  } else {
    await updateDoc(ref, data);
  }
}

// 🔸 削除
export async function deleteProject(id: string): Promise<void> {
  const ref = doc(db, "projects", id);
  await deleteDoc(ref);
}

// 新しいタスクを追加
export async function addTask(task: Omit<Task, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "tasks"), task);
  return docRef.id;
}

// タスクを更新（タイトル、完了状態など）
export async function updateTask(
  id: string,
  data: Partial<Omit<Task, "id">>
): Promise<void> {
  const docRef = doc(db, "tasks", id);
  await updateDoc(docRef, data);
}

// タスクを削除
export async function deleteTask(id: string): Promise<void> {
  const docRef = doc(db, "tasks", id);
  await deleteDoc(docRef);
}

// ラベル一覧取得（ユーザーID指定）
export async function fetchLabels(userId: string) {
  const q = query(collection(db, "labels"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      color: data.color,
      ownerId: data.ownerId,
    };
  });
}

// ラベル追加
export async function addLabel(userId: string, name: string, color: string) {
  await addDoc(collection(db, "labels"), { userId, name, color });
}

// ラベル更新
export async function updateLabel(
  labelId: string,
  data: { name?: string; color?: string }
) {
  const docRef = doc(db, "labels", labelId);
  await updateDoc(docRef, data);
}

// ラベル削除
export async function deleteLabel(labelId: string) {
  const docRef = doc(db, "labels", labelId);
  await deleteDoc(docRef);
}

export async function fetchLabelsMapForTasks(
  taskIds: string[]
): Promise<Record<string, Label[]>> {
  if (taskIds.length === 0) return {};

  // task_labels コレクションからタスクとラベルのペアを取得
  const q = query(
    collection(db, "task_labels"),
    where("taskId", "in", taskIds)
  );
  const taskLabelSnapshot = await getDocs(q);

  const taskLabelPairs = taskLabelSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      taskId: data.taskId as string,
      labelId: data.labelId as string,
    };
  });

  const labelIds = [...new Set(taskLabelPairs.map((pair) => pair.labelId))];
  if (labelIds.length === 0) return {};

  // ラベル情報を取得
  const labelSnapshot = await getDocs(
    query(collection(db, "labels"), where(documentId(), "in", labelIds))
  );

  const labelMap: Record<string, Label> = {};
  labelSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    labelMap[doc.id] = {
      id: doc.id,
      name: data.name,
      color: data.color,
      ownerId: data.ownerId,
    };
  });

  // taskId ごとに対応する Label[] を作成
  const taskLabelsMap: Record<string, Label[]> = {};
  taskLabelPairs.forEach(({ taskId, labelId }) => {
    if (!taskLabelsMap[taskId]) {
      taskLabelsMap[taskId] = [];
    }
    const label = labelMap[labelId];
    if (label) {
      taskLabelsMap[taskId].push(label);
    }
  });

  return taskLabelsMap;
}

// タスクにラベルを割り当てる
export async function assignLabelToTask(taskId: string, labelId: string) {
  const docRef = await addDoc(collection(db, "task_labels"), {
    taskId,
    labelId,
  });
  return docRef.id;
}

// タスクからラベルを削除
export async function removeLabelFromTask(taskId: string, labelId: string) {
  const q = query(
    collection(db, "task_labels"),
    where("taskId", "==", taskId),
    where("labelId", "==", labelId)
  );
  const snapshot = await getDocs(q);
  snapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
}

// タスクに割り当てられたラベルを取得
export async function fetchLabelsForTask(taskId: string): Promise<Label[]> {
  const q = query(collection(db, "task_labels"), where("taskId", "==", taskId));
  const snapshot = await getDocs(q);
  const labelIds = snapshot.docs.map((doc) => doc.data().labelId);

  if (labelIds.length === 0) return [];

  const labelsSnapshot = await getDocs(
    query(collection(db, "labels"), where(documentId(), "in", labelIds))
  );
  return labelsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Label[];
}

// 🔥 新しい関数：ラベル付きでタスクを追加
export async function addTaskWithLabels(
  task: Omit<Task, "id" | "labels">,
  labelIds: string[]
): Promise<string> {
  const taskRef = await addDoc(collection(db, "tasks"), task);

  // 中間テーブル task_labels に追加
  for (const labelId of labelIds) {
    await addDoc(collection(db, "task_labels"), {
      taskId: taskRef.id,
      labelId,
    });
  }

  return taskRef.id;
}

// 🔸 別の testable 関数
export function createAddTaskFn(dbInstance: typeof db) {
  return async function (task: Omit<Task, "id">): Promise<string> {
    const docRef = await addDoc(collection(dbInstance, "tasks"), task);
    return docRef.id;
  };
}
