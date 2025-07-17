"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import ProjectListPage from "./projects/page";
import AnimatedBackground from "./components/AnimatedBackground";
import { saveUserData } from "@/lib/saveUserData";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("匿名ログイン失敗", e);
          router.replace("/auth");
        }
      } else {
        await saveUserData(user.uid, "your-app-id", {
          email: user.email || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  const handleLogin = () => {
    router.push("/auth"); // 認証ページへ遷移
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        <p className="text-center py-20">読み込み中...</p>
      </div>
    );
  }

  const isAnonymous = user?.isAnonymous;

  return (
    <>
      <AnimatedBackground />
      <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <div>
          {user && !isAnonymous ? (
            <>
              ログイン中:{" "}
              <strong>{user.email ?? user.displayName ?? "ユーザー"}</strong>
            </>
          ) : (
            "ログインしていません"
          )}
        </div>

        {user ? (
          isAnonymous ? (
            <button
              onClick={handleLogin}
              className="bg-green-600 hover:bg-green-700 py-1 px-3 rounded transition"
            >
              ログイン
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 py-1 px-3 rounded transition"
            >
              ログアウト
            </button>
          )
        ) : null}
      </header>

      <main className="p-6">
        <ProjectListPage />
      </main>
    </>
  );
}
