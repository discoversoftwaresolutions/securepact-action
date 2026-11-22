'use strict';
const fs = require('node:fs');
const https = require('node:https');

function input(name, required = false) {
  const value = (process.env['INPUT_' + name.toUpperCase().replace(/-/g, '_')] || '').trim();
  if (required && !value) throw new Error('Missing required input: ' + name);
  return value;
}
function output(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, name + '=' + String(value).replace(/[\r\n]/g, '') + '\n');
  }
}
function request(url, token, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(url, {
      method: 'POST',
      timeout: 30000,
      headers: {
        Authorization: 'ApiKey ' + token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'securepact-github-action/0.1'
      }
    }, res => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        raw += chunk;
        if (raw.length > 1024 * 1024) res.destroy(new Error('Response too large'));
      });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300)
          return reject(new Error('SecurePact API returned HTTP ' + res.statusCode));
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error('SecurePact API did not return valid JSON')); }
      });
    });
    req.on('timeout', () => req.destroy(new Error('SecurePact API timeout')));
    req.on('error', reject);
    req.end(body);
  });
}
async function main() {
  const token = input('api-key', true);
  console.log('::add-mask::' + token);
  const url = new URL(input('api-url', true));
  if (url.protocol !== 'https:' || url.username || url.password || url.hash)
    throw new Error('api-url must be an HTTPS URL without embedded credentials or fragments');
  const mode = input('scan-mode') || 'full';
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(mode)) throw new Error('Invalid scan-mode');
  const payload = {
    repository: process.env.GITHUB_REPOSITORY || '',
    commit_sha: process.env.GITHUB_SHA || '',
    ref: process.env.GITHUB_REF || '',
    run_id: process.env.GITHUB_RUN_ID || '',
    scan_mode: mode
  };
  if (!payload.repository || !/^[0-9a-f]{40}$/.test(payload.commit_sha))
    throw new Error('GitHub repository and 40-character commit SHA are required');
  // Only repository metadata is sent. No source code or secrets are uploaded.
  const result = await request(url, token, payload);
  // Fail closed on ambiguous or asynchronous responses; never claim a queued scan passed.
  if (!result || result.status !== 'completed' || typeof result.findings_count !== 'number' ||
      !Number.isSafeInteger(result.findings_count) || result.findings_count < 0 ||
      typeof result.scan_id !== 'string' || !result.scan_id)
    throw new Error('SecurePact API did not return a completed scan with valid scan_id and findings_count');
  output('scan-id', result.scan_id);
  output('findings-count', result.findings_count);
  if (typeof result.attestation_id === 'string') output('attestation-id', result.attestation_id);
  console.log('SecurePact completed scan. Findings: ' + result.findings_count);
  if (input('fail-on-findings') === 'true' && result.findings_count > 0)
    throw new Error('SecurePact reported findings');
}
main().catch(err => {
  console.error('::error::' + String(err.message).replace(/[\r\n]/g, ' '));
  process.exitCode = 1;
});
