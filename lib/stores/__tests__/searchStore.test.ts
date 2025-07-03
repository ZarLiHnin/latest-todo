import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSearchStore } from "../searchStore";

describe("useSearchStore", () => {
  it("初期値は空文字であること", () => {
    const { result } = renderHook(() => useSearchStore());
    expect(result.current.keyword).toBe("");
  });

  it("setKeywordで更新されること", () => {
    const { result } = renderHook(() => useSearchStore());

    act(() => {
      result.current.setKeyword("React");
    });

    expect(result.current.keyword).toBe("React");
  });
});
