import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { contactIssues } from '../scripts/contact-policy.mjs';
import { failedJobs, REQUIRED_JOBS } from '../scripts/ci-gate.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('closed contact satisfies governance without inventing a destination', () => assert.deepEqual(contactIssues(html), []));
test('reopening a closed field fails governance', () => assert.ok(contactIssues(html.replace('<input disabled', '<input')).length));
test('removing the availability notice fails governance', () => assert.ok(contactIssues(html.replace('data-contact-status="unavailable"', '')).length));
test('a hidden WhatsApp destination cannot bypass the closed state', () => assert.ok(contactIssues(html + '<a href="https://wa.me/5511999990000">Ir</a>').length));
test('an active form still requires a valid phone and visible destination notice', () => {
  assert.ok(contactIssues('<form><input></form>').length);
  assert.ok(contactIssues('<a href="https://wa.me/5511999990000">WhatsApp</a>').length);
  assert.deepEqual(contactIssues('<form><input></form><a href="https://wa.me/5511987654321">WhatsApp</a>'), []);
});
test('the delivery gate rejects every failed, skipped, cancelled or missing dependency', () => {
  const success = Object.fromEntries(REQUIRED_JOBS.map((name) => [name, { result: 'success' }]));
  assert.deepEqual(failedJobs(success), []);
  for (const name of REQUIRED_JOBS) {
    for (const result of ['failure', 'skipped', 'cancelled', undefined]) {
      assert.deepEqual(failedJobs({ ...success, [name]: { result } }), [name]);
    }
  }
  assert.equal(failedJobs({}).length, REQUIRED_JOBS.length);
});

