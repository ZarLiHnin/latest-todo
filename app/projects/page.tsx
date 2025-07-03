"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/firestore";
import { buildProjectTree } from "@/lib/utils";
import ProjectTree from "../components/ProjectTree";
import NewProjectForm from "../components/NewProjectForm";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ← 追加

export default function ProjectListPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: projects } = useQuery({
    queryKey: ["projects", user?.uid],
    queryFn: () => (user ? fetchProjects(user.uid) : Promise.resolve([])),
    enabled: !!user,
  });

  if (loading) {
    return <p className="text-center py-20 text-gray-600">読み込み中...</p>;
  }
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

  const tree = buildProjectTree(projects ?? []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">📁 プロジェクト一覧（階層構造）</h1>
      <NewProjectForm
        ownerId={user.uid}
        existingProjects={projects ?? []}
        onCreated={() =>
          queryClient.invalidateQueries({ queryKey: ["projects"] })
        }
      />
      <div className="bg-white rounded-xl shadow p-4">
        {tree.length > 0 ? (
          <ProjectTree
            nodes={tree}
            renderItem={(project) => (
              <Link
                href={`/projects/${project.id}`}
                className="text-blue-600 hover:underline transition hover:text-blue-800"
              >
                {project.name}
              </Link>
            )}
            onUpdated={() =>
              queryClient.invalidateQueries({ queryKey: ["projects"] })
            }
          />
        ) : (
          <p className="text-gray-500">プロジェクトがありません。</p>
        )}
      </div>
    </div>
  );
}
