"use client"; // これで page.tsx はクライアントコンポーネントになる

import { useCurrentUser } from "@/lib/useCurrentUser";
import LabelManager from "../components/LabelManager";
import AnimatedBackground from "../components/AnimatedBackground";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation"; // ← 追加

export default function LabelSettingsPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter(); // ← 追加

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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth"); // ← サインアウト後に /auth へ遷移
  };

  return (
    <>
      <AnimatedBackground />
      <header className="flex justify-between items-center p-4 bg-blue-600 text-white relative z-10">
        <div>
          ログイン中:{" "}
          <strong>{user.email ?? user.displayName ?? "ユーザー"}</strong>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 py-1 px-3 rounded transition"
        >
          ログアウト
        </button>
      </header>

      <main className="max-w-xl mx-auto py-10 px-4 relative z-10">
        <h1 className="text-2xl font-bold mb-4">ラベル管理</h1>
        <LabelManager ownerId={user.uid} />
      </main>
    </>
  );
}
