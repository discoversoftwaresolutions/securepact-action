# SecurePact Action API contract (proposed)

This document describes the interface expected by the GitHub Action. It is **not** evidence that the private SecurePact backend implements it.

## Request

The action sends a POST to the user-configured HTTPS `api-url` with an `Authorization: ApiKey <key>` header (the existing SecurePact authentication scheme). Example body:

```json
{
  "repository": "owner/repo",
  "commit_sha": "0123456789abcdef0123456789abcdef01234567",
  "ref": "refs/heads/main",
  "run_id": "123456789",
  "scan_mode": "full"
}
```

Only repository metadata is transmitted. The service must independently obtain repository content using an explicitly authorized GitHub App installation or other approved mechanism. Never trust caller-provided tenant identifiers.

## Completed response

```json
{
  "status": "completed",
  "scan_id": "example-scan-id",
  "findings_count": 0,
  "attestation_id": "example-attestation-id"
}
```

A queued response is **not** a completed scan and will cause the current Action to fail. An asynchronous polling adapter should be added after verifying the actual backend contract.

## Backend requirements

- Authenticate API keys and derive the tenant from server-side credentials.
- Verify the GitHub installation has access to the requested repository and revision.
- Implement replay/idempotency protection for GitHub run IDs.
- Persist scan results and attestation evidence before returning `completed`.
- Do not echo credentials, raw source, or sensitive findings in errors.
- Return clear non-2xx responses for denied or failed scans.

No live endpoint, security finding, or attestation has been certified by this repository alone.
