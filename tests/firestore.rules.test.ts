import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";

const rules = readFileSync("firestore.rules", "utf8");

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-todo-app",
    firestore: {
      rules,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("Firestore security rules", () => {
  it("自分のタスクは読み書きできる", async () => {
    const user = testEnv.authenticatedContext("user_123");
    const db = user.firestore();

    const taskRef = doc(db, "tasks/task_abc");

    await assertSucceeds(
      setDoc(taskRef, {
        title: "Test Task",
        ownerId: "user_123",
        isCompleted: false,
      })
    );

    await assertSucceeds(getDoc(taskRef));
  });

  it("他人のタスクにはアクセスできない", async () => {
    const owner = testEnv.authenticatedContext("user_456");
    const db = owner.firestore();
    const taskRef = doc(db, "tasks/task_xyz");

    await setDoc(taskRef, {
      title: "他人のタスク",
      ownerId: "user_456",
      isCompleted: false,
    });

    const otherUser = testEnv.authenticatedContext("user_789");
    const otherDb = otherUser.firestore();

    await assertFails(getDoc(doc(otherDb, "tasks/task_xyz")));
  });

  it("未認証ユーザーは何もできない", async () => {
    const anon = testEnv.unauthenticatedContext();
    const db = anon.firestore();

    const taskRef = doc(db, "tasks/task_anon");

    await assertFails(
      setDoc(taskRef, {
        title: "無効なタスク",
        ownerId: "anon",
        isCompleted: false,
      })
    );
  });
});
