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
