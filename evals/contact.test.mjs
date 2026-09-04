import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script, runInNewContext } from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("no visitor is sent to an unconfirmed contact", () => {
  assert.ok(!html.includes("5511999990000"));
  assert.match(html, /data-contact-status="unavailable"/);
  assert.match(html, /(?:type="submit" disabled|id="cgo" disabled)/);
  assert.ok(!html.includes('href="#" rel="noopener">Instagram'));
});

test("scripts remain valid after closing the unavailable contact", () => {
  for (const [, source] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    new Script(source);
  }
});

test("unavailable form focuses its explanation without claiming receipt", () => {
  const source = html.split("\n").find((line) => line.startsWith('$("#fm").addEventListener("submit"'));
  if (!source) return;
  let prevented = false;
  let focused = false;
  runInNewContext(source, {
    $: () => ({ addEventListener: (_event, submit) => submit({ preventDefault: () => { prevented = true; } }) }),
    document: { getElementById: (id) => { assert.equal(id, "contact-status"); return { focus: () => { focused = true; } }; } },
  });
  assert.ok(prevented && focused);
});
