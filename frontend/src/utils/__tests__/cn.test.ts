import { describe, expect, it } from "vitest";
import { cn } from "@/utils/cn";

describe("cn", () => {
  it("menggabungkan class dan mengabaikan nilai falsy", () => {
    const hidden = false as boolean;
    expect(cn("px-2", hidden && "hidden", undefined, "py-1")).toBe("px-2 py-1");
  });

  it("class belakangan menang atas yang bentrok", () => {
    expect(cn("px-2 text-text", "px-4")).toBe("text-text px-4");
  });

  it("mengenal token radius custom", () => {
    expect(cn("rounded-card", "rounded-control")).toBe("rounded-control");
  });
});
