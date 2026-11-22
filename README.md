# SecurePact for GitHub

SecurePact by Discover Software Solutions provides repository security scanning and a pathway to SecurePact's agent protection and monitoring platform.

## Available GitHub Action: repository scanning

The published Action currently invokes seven server-side scanners: source code, dependencies, secrets, containers, infrastructure as code, Kubernetes, and API security. It returns a scan ID, findings count, and optional attestation identifier. **Live end-to-end certification is pending.** The Action does not itself install a runtime agent, quarantine processes, fence execution, or activate standby workloads.

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
          tenant-id: ${{ vars.SECUREPACT_TENANT_ID }}
          scan-mode: full
          fail-on-findings: 'false'
```

Use a pinned immutable Action commit SHA for production workflows. Configure `SECUREPACT_SCAN_API_URL` to the deployed and verified production endpoint (intended: `https://api.securepact.net/api/integrations/github/scan`). Do not point customers at the certification service.

## Agent protection and monitoring

SecurePact's proprietary platform includes agent monitoring, quarantine, execution fencing, durable ownership, standby takeover, authenticated checkpoints, authorized continuation, and PostgreSQL evidence. These capabilities are **part of the planned GitHub customer offering**, but are **not invoked by this repository-scanning Action today**.

Agent protection requires an authenticated integration with the customer's actual agent runtime, tenant-scoped authorization, and permission to execute containment and recovery operations. A GitHub workflow alone cannot isolate a remote agent or assume control of its execution environment.

The commercial integration should connect GitHub customers to their SecurePact tenant and agent runtime using dedicated authenticated agent registration, telemetry, and incident-response APIs. The private server remains the enforcement authority. Do not ship production API credentials, internal authority keys, or customer telemetry in this public repository.

## Action inputs

- `api-key` (required): SecurePact API key, stored in GitHub Actions secrets.
- `api-url` (required): Complete HTTPS scan endpoint.
- `tenant-id` (required): Authorized SecurePact tenant identifier.
- `scan-mode`: Scan profile; defaults to `full`.
- `fail-on-findings`: `true` fails the job when findings are reported.

## Outputs

`scan-id`, `findings-count`, and optional `attestation-id`.

See [API contract](docs/API-CONTRACT.md). Scanning and agent-protection engines remain on private SecurePact infrastructure.
