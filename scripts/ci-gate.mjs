import { pathToFileURL } from 'node:url';

export const REQUIRED_JOBS = ['build', 'test-eval-smoke', 'iso-governance', 'secret-scan', 'docker-build', 'product-regressions', 'guardrails-check'];
/** @param {Record<string, {result?: string}>} results @returns {string[]} */
export function failedJobs(results) {
  return REQUIRED_JOBS.filter((name) => results[name]?.result !== 'success');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const failures = failedJobs(JSON.parse(process.env.NEEDS_JSON ?? '{}'));
  console.log(JSON.stringify({ event: 'delivery.gate', pass: failures.length === 0, failures }));
  if (failures.length) process.exitCode = 1;
}

