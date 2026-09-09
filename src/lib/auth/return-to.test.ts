import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sanitizeReturnTo } from "./return-to.ts";

describe("sanitizeReturnTo", () => {
  it("allows the dashboard path", () => {
    assert.equal(sanitizeReturnTo("/dashboard"), "/dashboard");
  });

  it("rejects open redirects", () => {
    assert.equal(sanitizeReturnTo("https://evil.example"), "/dashboard");
    assert.equal(sanitizeReturnTo("//evil.example"), "/dashboard");
    assert.equal(sanitizeReturnTo("/dashboard/../admin"), "/dashboard");
  });

  it("rejects unknown internal paths", () => {
    assert.equal(sanitizeReturnTo("/admin"), "/dashboard");
    assert.equal(sanitizeReturnTo("/api/me"), "/dashboard");
  });
});
