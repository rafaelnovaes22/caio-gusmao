import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script } from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");

test("every local script is included in the deployed image", () => {
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)];
  for (const [, script] of scripts) {
    assert.ok(dockerfile.includes("COPY " + script + " "), script);
    new Script(readFileSync(new URL("../" + script, import.meta.url), "utf8"));
  }
  assert.ok(scripts.length > 0);
});

test("all inline scripts parse", () => {
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    new Script(script);
  }
});
