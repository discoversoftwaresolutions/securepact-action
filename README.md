# SecurePact GitHub Action

Public integration client for SecurePact by Discover Software Solutions.

**Status: integration foundation; not yet production-certified.** The Action requires an HTTPS SecurePact scan API endpoint implementing the documented contract. No live scanning, findings, or attestation have been verified.

## Usage

```yaml
name: SecurePact Scan
on:
  push:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: discoversoftwaresolutions/securepact-action@main
        with:
          api-key: ${{ secrets.SECUREPACT_API_KEY }}
          api-url: ${{ vars.SECUREPACT_SCAN_API_URL }}
          scan-mode: full
          fail-on-findings: 'false'
```

Pin to an immutable commit SHA for production use; no versioned release has been published.

The Action sends repository metadata (repository, commit SHA, ref, run ID, scan mode), **not source code**, to the configured HTTPS endpoint. It requires a completed scan result and fails on incomplete or queued responses.

## Inputs

- `api-key` (required): SecurePact API key from GitHub Actions secrets
- `api-url` (required): complete HTTPS scan endpoint
- `scan-mode`: scan profile, defaults to `full`
- `fail-on-findings`: set to `true` to fail when findings are reported

## Outputs

`scan-id`, `findings-count`, and optional `attestation-id`.

See [proposed API contract](docs/API-CONTRACT.md). The proprietary SecurePact scanning engine remains in private infrastructure.
