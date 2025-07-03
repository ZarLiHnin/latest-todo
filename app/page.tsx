"use client";

import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import AuthPage from "./auth/page";
import ProjectListPage from "./projects/page";
import AnimatedBackground from "./components/AnimatedBackground";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center py-20">読み込み中...</p>;

  if (!user) return <AuthPage />;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <AnimatedBackground />
      <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <div>
          ログイン中:{" "}
          <strong>{user.email ?? user.displayName ?? "ユーザー"}</strong>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 py-1 px-3 rounded transition"
        >
          ログアウト
        </button>
      </header>

      <main className="p-6">
        <ProjectListPage />
      </main>
    </>
  );
}
