# RO-LCP

RO-LCP is a local Linux system monitoring project built with Ralph Orchestrator ($RO).

It uses autonomous agents to collect real system metrics, persist them as artifacts,
and validate outputs against contract-first specifications.

---

## What it does

- Collects CPU, memory, and disk metrics
- Stores metrics as JSON artifacts
- Validates outputs against a formal contract
- Runs fully locally with no external services

---

## How it works

Agents are executed by Ralph Orchestrator and communicate only through artifacts.

1. A system snapshot agent collects metrics
2. A validation agent checks the output against a written spec

---

## Running locally

```bash
ralph run

## Policies

RO-LCP uses deterministic policies to decide when detected drift
represents a meaningful system issue.

Policies are defined in YAML and evaluated against drift reports.

### Example

```yaml
cpu:
  max_drift_percent: 20

memory:
  min_free_mb: 24000

disk:
  min_free_gb: 15
