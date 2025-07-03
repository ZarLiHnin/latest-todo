"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // 成功アニメーション表示中に3秒後リダイレクト
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showSuccess) {
      timer = setTimeout(() => {
        router.push("/");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccess, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // バリデーション
    if (!email || !password) {
      setMessage("メールアドレスとパスワードは必須です。");
      return;
    }
    if (password.length < 6) {
      setMessage("パスワードは6文字以上で入力してください。");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("ログイン成功 🎉");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("ユーザー登録成功 🎉");
      }
      setShowSuccess(true);
    } catch (err) {
      setShowSuccess(false);
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setMessage("このメールアドレスはすでに登録されています。");
            break;
          case "auth/user-not-found":
            setMessage("ユーザーが見つかりません。");
            break;
          case "auth/wrong-password":
            setMessage("パスワードが間違っています。");
            break;
          case "auth/invalid-email":
            setMessage("無効なメールアドレスです。");
            break;
          default:
            setMessage("認証時にエラーが発生しました。");
        }
      } else {
        setMessage("認証時にエラーが発生しました。");
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-500
        ${
          isLogin
            ? "bg-gradient-to-br from-blue-50 to-blue-200"
            : "bg-gradient-to-br from-green-50 to-green-200"
        }`}
    >
      <div className="relative bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        {/* 成功アニメーションオーバーレイ */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-2xl z-50"
            >
              <p className="text-xl font-semibold text-green-700 mb-2">
                {message}
              </p>
              <p className="text-sm text-gray-600 animate-pulse">
                ホームへ移動中…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* フォーム本体 */}
        {!showSuccess && (
          <>
            <h1
              className={`text-2xl font-bold mb-6 ${
                isLogin ? "text-blue-700" : "text-green-700"
              }`}
            >
              {isLogin ? "ログイン" : "ユーザー登録"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full p-3 border rounded-lg"
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="w-full p-3 border rounded-lg"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className={`w-full text-white py-3 rounded-lg transition ${
                  isLogin
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                type="submit"
              >
                {isLogin ? "ログイン" : "登録"}
              </button>
            </form>

            <p className="text-center mt-4 text-sm">
              {isLogin ? "アカウントがない？" : "すでに登録済み？"}{" "}
              <button
                className="text-blue-600 underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "登録へ" : "ログインへ"}
              </button>
            </p>

            {message && (
              <p className="mt-4 text-sm text-red-500 font-medium">{message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
