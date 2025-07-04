"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, fetchLabels, fetchTasks } from "@/lib/firestore";
import { useParams, useRouter } from "next/navigation";
import NewTaskForm from "@/app/components/NewTaskForm";
import TaskList from "@/app/components/TaskList";
import { useTaskFilterStore } from "@/stores/taskFilterStore";
import type { Label, Project } from "@/types/project";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function ProjectTasksPage() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const params = useParams();
  const router = useRouter();

  const projectIdRaw = params.projectId;
  const projectId = Array.isArray(projectIdRaw)
    ? projectIdRaw[0]
    : projectIdRaw ?? "";

  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const setProjectFilter = useTaskFilterStore((s) => s.setProjectFilter);

  // データロード
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [labelResult, projectResult] = await Promise.all([
        fetchLabels(user.uid),
        fetchProjects(user.uid),
      ]);
      setLabels(labelResult);
      setProjects(projectResult);
    })();
  }, [user]);

  // プロジェクトフィルタ
  useEffect(() => {
    if (projectId) setProjectFilter(projectId);
  }, [projectId, setProjectFilter]);

  // タスク取得
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () =>
      user && projectId ? fetchTasks(user.uid) : Promise.resolve([]),
    enabled: !!user && !!projectId,
  });

  const filteredTasks = tasks?.filter((t) => t.projectId === projectId) ?? [];

  // ログアウト
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  // 読み込み中
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">読み込み中…</p>
      </div>
    );
  }

  // 未ログイン時
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <p className="text-lg text-gray-700">ログインが必要です</p>
        <button
          onClick={() => router.push("/auth")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ログインページへ
        </button>
      </div>
    );
  }

  return (
    <>
      <AnimatedBackground />

      {/* ヘッダー */}
      <header className="relative z-10 flex justify-between items-center p-4 bg-blue-600 text-white">
        <div>
          ログイン中:{" "}
          <strong>{user.email ?? user.displayName ?? "ユーザー"}</strong>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 py-1 px-3 rounded-md transition"
        >
          ログアウト
        </button>
      </header>

      {/* コンテンツ */}
      <main className="p-6 max-w-3xl mx-auto space-y-8 relative z-10">
        {/* 新規タスクフォーム */}
        <section className="bg-blue-50 bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            ✏️ 新しいタスクを追加
          </h2>
          <NewTaskForm
            projectId={projectId}
            labels={labels}
            onTaskAdded={() =>
              queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
            }
          />
        </section>

        {/* タスクリスト */}
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 現在のタスク
          </h2>
          {filteredTasks.length > 0 ? (
            <TaskList
              tasks={tasks ?? []}
              labels={labels}
              projects={projects}
              onTasksChanged={() =>
                queryClient.invalidateQueries({
                  queryKey: ["tasks", projectId],
                })
              }
            />
          ) : (
            <p className="text-center text-gray-400 italic">
              タスクはありません。
            </p>
          )}
        </section>
      </main>
    </>
  );
}
